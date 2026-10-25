const { Order, OrderItem, Notification, User, Book, Rent, Review, DeliveryStatusHistory, RiderApplication, ExchangeRequest, PaymentAuditLog, sequelize } = require("../models");
const { Op } = require("sequelize");
const { notifyUserAndEmail, notifyAdminUsers } = require("../utils/notificationHelper");

const normalizeOrderPayload = (payload = {}) => {
  const items = Array.isArray(payload.items) ? payload.items : [];
  const normalizedItems = items.map((item) => ({
    bookId: item.bookId || item.id || undefined,
    title: item.title || "Untitled",
    type: item.type || "buy",
    price: Number(item.price) || 0,
    quantity: Number(item.quantity) || 1,
    offeredBookId: item.offeredBookId || undefined,
    offeredBookTitle: item.offeredBookTitle || undefined
  }));

  return {
    buyerId: payload.buyerId,
    sellerId: payload.sellerId,
    items: normalizedItems,
    shippingAddress: payload.shippingAddress,
    shippingPhone: payload.shippingPhone,
    shippingName: payload.shippingName,
    trackingData: payload.trackingData || {},
    status: payload.status || "pending",
  };
};

const createOrder = async (req, res) => {
  const payload = normalizeOrderPayload(req.body);
  payload.buyerId = payload.buyerId || req.user.id;

  // Handle sellerId if it's an object (from Book owner association)
  if (payload.sellerId && typeof payload.sellerId === 'object') {
    payload.sellerId = payload.sellerId.id || payload.sellerId._id;
  }

  // Islamabad-only validation for buyer
  if (payload.shippingAddress && !payload.shippingAddress.toLowerCase().includes('islamabad')) {
    return res.status(400).json({ msg: "Sorry, we currently only deliver to Islamabad addresses." });
  }

  if (!payload.sellerId || !payload.items.length) {
    return res.status(400).json({ msg: "sellerId and items are required." });
  }

  const hasRentItem = payload.items.some(item => String(item.type).toLowerCase() === 'rent');
  const hasExchangeItem = payload.items.some(item => String(item.type).toLowerCase() === 'exchange');
  
  if (hasRentItem) {
    payload.orderType = 'RENT';
  } else if (hasExchangeItem || req.body.orderType === 'EXCHANGE') {
    payload.orderType = 'EXCHANGE';
  } else {
    payload.orderType = 'BUY';
  }

  // SERVER-SIDE VALIDATION OF PRICES & CALCULATIONS
  // Never trust frontend totals - recompute using actual database values
  let calculatedBookAmount = 0;
  let calculatedSecurityDeposit = 0;
  const validatedItems = [];

  for (const item of payload.items) {
    let verifiedPrice = 0;
    let verifiedSecDep = 0;
    let bookTitle = item.title;

    if (item.bookId) {
      const book = await Book.findByPk(item.bookId, {
        include: [{ model: Rent, as: 'rentDetails' }]
      });

      if (!book) {
        return res.status(404).json({ msg: `Book not found: ${item.title || item.bookId}` });
      }

      bookTitle = book.title;

      // Ensure sellerId strictly matches the book's true registered owner (seller) from DB
      if (book.ownerId) {
        payload.sellerId = book.ownerId;
      }

      if (payload.orderType === 'BUY') {
        verifiedPrice = Number(book.price) || 0;
      } else if (payload.orderType === 'RENT') {
        verifiedPrice = Number(book.rentDetails?.rentPrice || book.rentWeek || book.price) || 0;
        verifiedSecDep = Number(book.securityDeposit) || 0;
      } else if (payload.orderType === 'EXCHANGE') {
        verifiedPrice = 0; // Pure exchange book price is 0
      }
    } else {
      verifiedPrice = Number(item.price) || 0;
    }

    const qty = Number(item.quantity) || 1;
    calculatedBookAmount += verifiedPrice * qty;
    calculatedSecurityDeposit += verifiedSecDep * qty;

    validatedItems.push({
      bookId: item.bookId,
      title: bookTitle,
      type: item.type,
      price: verifiedPrice,
      quantity: qty,
      offeredBookId: item.offeredBookId,
      offeredBookTitle: item.offeredBookTitle
    });
  }

  // Delivery charge calculation: Rs. 120 per non-exchange item (Islamabad delivery)
  const paidItemsCount = validatedItems.filter(i => String(i.type).toLowerCase() !== 'exchange').length;
  const calculatedDeliveryFee = paidItemsCount > 0 ? paidItemsCount * 120 : 0;
  const calculatedTotalAmount = calculatedBookAmount + calculatedDeliveryFee + calculatedSecurityDeposit;

  // Platform commission calculation (if configured via env, otherwise 0)
  const commissionRate = Number(process.env.BOOKCYCLE_COMMISSION_PERCENT) || 0;
  const calculatedCommission = commissionRate > 0 ? (calculatedBookAmount * commissionRate) / 100 : 0.00;

  // Seller payable amount is the book/rental price (minus any platform commission)
  const sellerPayable = Math.max(0, calculatedBookAmount - calculatedCommission);
  // Rider earning is the delivery charge
  const riderEarning = calculatedDeliveryFee;

  // Duplicate order prevention: check if identical order created within last 15 seconds
  const recentDuplicate = await Order.findOne({
    where: {
      buyerId: payload.buyerId,
      sellerId: payload.sellerId,
      totalAmount: calculatedTotalAmount,
      status: { [Op.in]: ['pending', 'pending_seller'] },
      createdAt: { [Op.gte]: new Date(Date.now() - 15000) }
    }
  });
  if (recentDuplicate) {
    return res.status(200).json({ order: recentDuplicate, msg: "Order already placed." });
  }

  payload.bookAmount = calculatedBookAmount;
  payload.deliveryFee = calculatedDeliveryFee;
  payload.totalAmount = calculatedTotalAmount;
  payload.items = validatedItems;

  // COD specific fields
  payload.paymentMethod = 'COD';
  payload.paymentStatus = 'COD_PENDING';
  payload.codAmountDue = calculatedTotalAmount;
  payload.codAmountCollected = 0.00;
  payload.depositStatus = 'PENDING';
  payload.depositAmount = 0.00;
  payload.sellerPayableAmount = sellerPayable;
  payload.sellerPayoutStatus = 'PENDING';
  payload.riderEarningAmount = riderEarning;
  payload.riderPayoutStatus = 'PENDING';
  payload.platformCommission = calculatedCommission;
  payload.securityDeposit = calculatedSecurityDeposit;
  payload.securityDepositStatus = calculatedSecurityDeposit > 0 ? 'HELD' : 'NONE';
  payload.hasDiscrepancy = false;

  payload.trackingData = {
    ...payload.trackingData,
    trackingNumber: `BC-${Date.now().toString().slice(-6)}`
  };

  const t = await sequelize.transaction();

  try {
    const order = await Order.create(payload, { transaction: t });

    const itemsToCreate = validatedItems.map(item => ({
      orderId: order.id,
      bookId: item.bookId,
      title: item.title,
      type: item.type,
      price: item.price,
      quantity: item.quantity
    }));

    await OrderItem.bulkCreate(itemsToCreate, { transaction: t });

    // Initial Payment Audit Log
    await PaymentAuditLog.create({
      orderId: order.id,
      action: 'ORDER_CREATED',
      amount: calculatedTotalAmount,
      performedBy: payload.buyerId,
      performedByRole: 'customer',
      previousPaymentStatus: null,
      newPaymentStatus: 'COD_PENDING',
      note: `Order placed with Cash on Delivery (COD). Total Payable: Rs. ${calculatedTotalAmount} (Book: Rs. ${calculatedBookAmount}, Delivery: Rs. ${calculatedDeliveryFee}${calculatedSecurityDeposit > 0 ? ', Deposit: Rs. ' + calculatedSecurityDeposit : ''})`
    }, { transaction: t });

    await t.commit();

    // 1. RECORD HISTORY IN DB
    try {
      await DeliveryStatusHistory.create({
        orderId: order.id,
        status: 'CREATED',
        updatedBy: payload.buyerId,
        note: 'Order created by buyer'
      });
    } catch (histErr) {
      console.error("Order creation history create error:", histErr);
    }

    // 2. NOTIFY SELLER, ADMIN, & BUYER AFTER SUCCESSFUL CREATION
    const buyerUser = await User.findByPk(payload.buyerId);
    const buyerName = payload.shippingName || (buyerUser ? buyerUser.name : "Buyer");
    const sellerUser = await User.findByPk(payload.sellerId);
    const bookTitle = payload.items[0]?.title || "Book";

    if (payload.orderType === 'RENT') {
      // SELLER
      await notifyUserAndEmail({
        userId: payload.sellerId,
        userEmail: sellerUser?.email,
        userPhone: sellerUser?.phone,
        subject: `New Rental Request Received - Order #${order.id}`,
        message: `New BookCycle rental request received for your book "${bookTitle}" from ${buyerName}.`,
        type: "order",
        orderId: order.id
      });

      // ADMIN
      await notifyAdminUsers({
        subject: `New Rent Order #${order.id}`,
        message: `New Rent Order #${order.id} has been placed.`,
        orderId: order.id
      });

      // BUYER
      await notifyUserAndEmail({
        userId: payload.buyerId,
        userEmail: buyerUser?.email,
        userPhone: payload.shippingPhone || buyerUser?.phone,
        subject: `Rental Request Placed - Order #${order.id}`,
        message: `Your rental request for "${bookTitle}" has been placed successfully. Order #${order.id}.`,
        type: "order",
        orderId: order.id,
        sendSmsFlag: true
      });
    } else if (payload.orderType === 'EXCHANGE') {
      // Sync with ExchangeRequest table
      try {
        const reqBookId = payload.items[0]?.bookId;
        const offBookId = payload.trackingData?.offeredBookId || payload.items[0]?.offeredBookId;
        if (reqBookId && offBookId) {
          const existingReq = await ExchangeRequest.findOne({
            where: {
              requesterId: payload.buyerId,
              requestedBookId: reqBookId,
              offeredBookId: offBookId,
              status: { [Op.in]: ['Pending', 'Accepted'] }
            }
          });
          if (!existingReq) {
            await ExchangeRequest.create({
              requesterId: payload.buyerId,
              ownerId: payload.sellerId,
              requestedBookId: reqBookId,
              offeredBookId: offBookId,
              status: 'Pending'
            });
          }
        }
      } catch (exReqErr) {
        console.warn("ExchangeRequest sync note:", exReqErr.message);
      }

      // SELLER
      await notifyUserAndEmail({
        userId: payload.sellerId,
        userEmail: sellerUser?.email,
        userPhone: sellerUser?.phone,
        subject: `New Exchange Request Received - Order #${order.id}`,
        message: `New BookCycle exchange request received for "${bookTitle}" from ${buyerName}.`,
        type: "exchange",
        orderId: order.id
      });

      // ADMIN
      await notifyAdminUsers({
        subject: `New Exchange Order #${order.id}`,
        message: `New Exchange Order #${order.id} has been created.`,
        orderId: order.id
      });

      // BUYER
      await notifyUserAndEmail({
        userId: payload.buyerId,
        userEmail: buyerUser?.email,
        userPhone: payload.shippingPhone || buyerUser?.phone,
        subject: `Exchange Request Sent - Order #${order.id}`,
        message: `Your exchange request for "${bookTitle}" has been placed successfully. Order #${order.id}.`,
        type: "exchange",
        orderId: order.id,
        sendSmsFlag: true
      });
    } else {
      // SALE (BUY)
      // SELLER
      await notifyUserAndEmail({
        userId: payload.sellerId,
        userEmail: sellerUser?.email,
        userPhone: sellerUser?.phone,
        subject: `New Order Received - Order #${order.id}`,
        message: `New BookCycle order received. Order #${order.id} has been placed for your book "${bookTitle}".`,
        type: "order",
        orderId: order.id
      });

      // ADMIN
      await notifyAdminUsers({
        subject: `New Sale Order #${order.id}`,
        message: `New Sale Order #${order.id} has been placed and requires processing.`,
        orderId: order.id
      });

      // BUYER
      await notifyUserAndEmail({
        userId: payload.buyerId,
        userEmail: buyerUser?.email,
        userPhone: payload.shippingPhone || buyerUser?.phone,
        subject: `Order Placed Successfully - Order #${order.id}`,
        message: `Your BookCycle order #${order.id} has been placed successfully.`,
        type: "order",
        orderId: order.id,
        sendSmsFlag: true
      });
    }

    const completeOrder = await Order.findByPk(order.id, {
      include: [
        { model: OrderItem, as: 'items' },
        { model: DeliveryStatusHistory, as: 'statusHistory' },
        { model: PaymentAuditLog, as: 'paymentHistory' }
      ]
    });

    return res.status(201).json({ order: completeOrder });
  } catch (error) {
    await t.rollback();
    console.error("Order creation failed:", error);
    return res.status(500).json({ msg: "Order creation failed", error: error.message });
  }
};

const getOrders = async (req, res) => {
  const { sellerId, buyerId, riderId } = req.query;
  const query = {};

  const isValidId = id => typeof id === 'string' && id.length > 0;
  if (sellerId && isValidId(sellerId)) query.sellerId = sellerId;
  if (buyerId && isValidId(buyerId)) query.buyerId = buyerId;
  if (riderId && isValidId(riderId)) query.riderId = riderId;

  // Security role check if user authenticated
  if (req.user) {
    if (req.user.role === 'customer' && !query.sellerId) {
      query.buyerId = req.user.id;
    } else if (req.user.role === 'shopkeeper' && !query.buyerId) {
      query.sellerId = req.user.id;
    } else if (req.user.role === 'rider') {
      query.riderId = req.user.id;
    }
  }

  const orders = await Order.findAll({
    where: query,
    order: [["createdAt", "DESC"]],
    include: [
      { model: User, as: "buyer", attributes: ["id", "name", "email", "phone", "address", "city"] },
      { model: User, as: "seller", attributes: ["id", "name", "email", "phone", "address", "city", "pickupAddress"] },
      { model: User, as: "rider", attributes: ["id", "name", "email", "phone"] },
      { model: RiderApplication, as: "riderProfile", attributes: ["id", "fullName", "phone", "vehicleType", "vehicleNumber", "isRiderActive"] },
      { model: OrderItem, as: "items" },
      { model: DeliveryStatusHistory, as: "statusHistory" },
      { model: PaymentAuditLog, as: "paymentHistory" }
    ]
  });

  let reviewedOrderIds = new Set();
  if (buyerId && isValidId(buyerId)) {
    const reviews = await Review.findAll({ where: { buyerId }, attributes: ["orderId"] });
    reviewedOrderIds = new Set(reviews.map(r => r.orderId));
  }

  const formattedOrders = orders.map(o => {
    const json = o.toJSON();
    if (json.buyer) json.buyerId = json.buyer;
    if (json.seller) json.sellerId = json.seller;
    json.hasReview = reviewedOrderIds.has(json.id);
    return json;
  });

  return res.status(200).json({ orders: formattedOrders, count: formattedOrders.length });
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, trackingData, paymentData, complainReason } = req.body;
    
    const order = await Order.findByPk(orderId, {
      include: [
        { model: User, as: "buyer" },
        { model: User, as: "seller" },
        { model: OrderItem, as: "items" }
      ]
    });
    if (!order) return res.status(404).json({ msg: "Order not found" });

    // Status transitions
    if (status) order.status = status;
    if (trackingData) {
      const existingTracking = order.trackingData || {};
      order.trackingData = { ...existingTracking, ...trackingData };
    }
    if (paymentData) {
      order.paymentData = { ...(order.paymentData || {}), ...paymentData };
    }
    
    await order.save();

    // Record History
    try {
      await DeliveryStatusHistory.create({
        orderId: order.id,
        status: status || 'UPDATED',
        updatedBy: req.user?.id || 'system',
        note: `Order status updated to ${status}`
      });
    } catch (histErr) {
      console.error("Update order history failed:", histErr);
    }

    const firstItem = order.items?.[0] || {};
    const bookTitle = firstItem.title || "Book";

    // Notification & Rent status flow logic
    if (status === "accepted") {
      for (const item of order.items) {
        if (item.bookId) {
          const book = await Book.findByPk(item.bookId);
          if (book) {
            await book.update({ status: "Unavailable" });
            if (order.orderType === "RENT") {
              const rent = await Rent.findOne({ where: { bookId: book.id } });
              if (rent) {
                await rent.update({ status: "Reserved" });
              }
            }
          }
        }
      }
      
      const msg = order.orderType === "RENT"
        ? `Your rental request for "${bookTitle}" has been approved by the seller.`
        : `Your order #${order.id} has been accepted by the seller.`;

      await notifyUserAndEmail({
        userId: order.buyerId,
        userEmail: order.buyer?.email,
        userPhone: order.shippingPhone || order.buyer?.phone,
        subject: `Order Accepted - #${order.id}`,
        message: msg,
        type: "order_update",
        orderId: order.id
      });

      await notifyAdminUsers({
        subject: `Order Accepted by Seller - #${order.id}`,
        message: `Order #${order.id} accepted by seller ${order.seller?.name || ''}. Ready for rider assignment.`,
        orderId: order.id
      });

    } else if (status === "rejected") {
      if (order.orderType === "RENT") {
        for (const item of order.items) {
          if (item.bookId) {
            const rent = await Rent.findOne({ where: { bookId: item.bookId } });
            if (rent) {
              await rent.update({ status: "Available" });
              const book = await Book.findByPk(item.bookId);
              if (book) {
                await book.update({ status: "Available" });
              }
            }
          }
        }
      }
      
      await notifyUserAndEmail({
        userId: order.buyerId,
        userEmail: order.buyer?.email,
        subject: `Order Update - Order #${order.id}`,
        message: `Your order #${order.id} for "${bookTitle}" has been rejected.`,
        type: "order_update",
        orderId: order.id
      });
    } else if (status === "cancelled") {
      if (order.orderType === "RENT") {
        for (const item of order.items) {
          if (item.bookId) {
            const rent = await Rent.findOne({ where: { bookId: item.bookId } });
            if (rent) {
              await rent.update({ status: "Available" });
              const book = await Book.findByPk(item.bookId);
              if (book) {
                await book.update({ status: "Available" });
              }
            }
          }
        }
      }
      await notifyUserAndEmail({
        userId: order.sellerId,
        userEmail: order.seller?.email,
        subject: `Order Cancelled - #${order.id}`,
        message: `Order #${order.id} for "${bookTitle}" was cancelled.`,
        type: "order_update",
        orderId: order.id
      });
      await notifyUserAndEmail({
        userId: order.buyerId,
        userEmail: order.buyer?.email,
        subject: `Order Cancelled - #${order.id}`,
        message: `Your order #${order.id} for "${bookTitle}" has been cancelled.`,
        type: "order_update",
        orderId: order.id
      });

      // COD payment audit tracking on cancellation
      try {
        if (order.paymentStatus === 'COD_COLLECTED' || order.paymentStatus === 'DEPOSITED') {
          await PaymentAuditLog.create({
            orderId: order.id,
            action: 'ORDER_CANCELLED_AFTER_COLLECTION',
            amount: Number(order.codAmountCollected) || 0,
            performedBy: req.user?.id || 'system',
            performedByRole: req.user?.role || 'system',
            previousPaymentStatus: order.paymentStatus,
            newPaymentStatus: order.paymentStatus,
            note: `Order cancelled after cash collection of Rs. ${order.codAmountCollected}. Refund or reconciliation required.`
          });
        } else {
          await PaymentAuditLog.create({
            orderId: order.id,
            action: 'ORDER_CANCELLED_BEFORE_COLLECTION',
            amount: 0,
            performedBy: req.user?.id || 'system',
            performedByRole: req.user?.role || 'system',
            previousPaymentStatus: order.paymentStatus,
            newPaymentStatus: order.paymentStatus,
            note: 'Order cancelled before cash collection. No cash was collected from customer.'
          });
        }
      } catch (cancelAuditErr) {
        console.error("Cancellation audit log error:", cancelAuditErr);
      }
    } else if (status === "completed") {
      if (order.orderType === "RENT") {
        for (const item of order.items) {
          if (item.bookId) {
            const rent = await Rent.findOne({ where: { bookId: item.bookId } });
            if (rent) {
              const startDate = new Date();
              const endDate = new Date();
              if (rent.rentalDuration === "3 Months") {
                endDate.setMonth(endDate.getMonth() + 3);
              } else if (rent.rentalDuration === "6 Months") {
                endDate.setMonth(endDate.getMonth() + 6);
              } else if (rent.rentalDuration === "1 Year") {
                endDate.setFullYear(endDate.getFullYear() + 1);
              } else {
                endDate.setMonth(endDate.getMonth() + 3);
              }

              await rent.update({
                status: "Rented",
                rentalStartDate: startDate,
                rentalEndDate: endDate
              });

              const book = await Book.findByPk(item.bookId);
              if (book) {
                await book.update({ status: "Unavailable" });
              }

              await notifyUserAndEmail({
                userId: order.buyerId,
                userEmail: order.buyer?.email,
                subject: `Rental Started - #${order.id}`,
                message: `Your rental for "${item.title}" has started! Active until ${endDate.toLocaleDateString()}.`,
                type: "general"
              });

              await notifyUserAndEmail({
                userId: order.sellerId,
                userEmail: order.seller?.email,
                subject: `Rental Active - #${order.id}`,
                message: `Rental has started for "${item.title}". Active until ${endDate.toLocaleDateString()}.`,
                type: "general"
              });
            }
          }
        }
      } else {
        await notifyUserAndEmail({
          userId: order.buyerId,
          userEmail: order.buyer?.email,
          subject: `Order Completed - #${order.id}`,
          message: `Your order #${order.id} is completed. Thank you!`,
          type: "order_update",
          orderId: order.id
        });

        await notifyUserAndEmail({
          userId: order.sellerId,
          userEmail: order.seller?.email,
          subject: `Order Earnings Added - #${order.id}`,
          message: `Order #${order.id} completed. Earnings added.`,
          type: "order_update",
          orderId: order.id
        });
        
        const earning = order.bookAmount != null ? Number(order.bookAmount) : Number(order.totalAmount);
        
        const seller = await User.findByPk(order.sellerId);
        if (seller) {
          seller.finance_totalEarnings = Number(seller.finance_totalEarnings || 0) + earning;
          seller.finance_monthlyEarnings = Number(seller.finance_monthlyEarnings || 0) + earning;
          seller.finance_completedOrdersRevenue = Number(seller.finance_completedOrdersRevenue || 0) + earning;
          await seller.save();
        }
      }
    }

    const finalFormattedOrder = order.toJSON();
    if (finalFormattedOrder.buyer) finalFormattedOrder.buyerId = finalFormattedOrder.buyer;
    if (finalFormattedOrder.seller) finalFormattedOrder.sellerId = finalFormattedOrder.seller;

    res.status(200).json({ order: finalFormattedOrder });
  } catch (error) {
    console.error("Order status update failed:", error);
    res.status(500).json({ msg: "Server Error", error: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  updateOrderStatus
};
