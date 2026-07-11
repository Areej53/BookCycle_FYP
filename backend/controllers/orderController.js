const { Order, OrderItem, Notification, User, Book, Rent, sequelize } = require("../models");

const sendEmailMock = (to, subject, text) => {
  console.log(`\n================= EMAIL =================`);
  console.log(`TO: ${to}\nSUBJECT: ${subject}\n\n${text}`);
  console.log(`===========================================\n`);
};

const normalizeOrderPayload = (payload = {}) => {
  const items = Array.isArray(payload.items) ? payload.items : [];
  const normalizedItems = items.map((item) => ({
    bookId: item.bookId || item.id || undefined,
    title: item.title || "Untitled",
    type: item.type || "buy",
    price: Number(item.price) || 0,
    quantity: Number(item.quantity) || 1,
  }));

  const totalAmount =
    payload.totalAmount != null
      ? Number(payload.totalAmount) || 0
      : normalizedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return {
    buyerId: payload.buyerId,
    sellerId: payload.sellerId,
    items: normalizedItems,
    bookAmount: payload.bookAmount != null ? Number(payload.bookAmount) : undefined,
    deliveryFee: payload.deliveryFee != null ? Number(payload.deliveryFee) : undefined,
    totalAmount,
    shippingAddress: payload.shippingAddress,
    shippingPhone: payload.shippingPhone,
    shippingName: payload.shippingName,
    status: payload.status || "pending",
  };
};

const createOrder = async (req, res) => {
  const payload = normalizeOrderPayload(req.body);
  payload.buyerId = payload.buyerId || req.user.id;

  const hasRentItem = payload.items.some(item => String(item.type).toLowerCase() === 'rent');
  payload.orderType = hasRentItem ? 'RENT' : 'BUY';

  if (!payload.sellerId || !payload.items.length) {
    return res.status(400).json({ msg: "sellerId and items are required." });
  }

  payload.trackingData = {
    ...payload.trackingData,
    trackingNumber: `BC-${Date.now().toString().slice(-6)}`
  };

  const t = await sequelize.transaction();

  try {
    const order = await Order.create(payload, { transaction: t });

    const itemsToCreate = payload.items.map(item => ({
      orderId: order.id,
      bookId: item.bookId,
      title: item.title,
      type: item.type,
      price: item.price,
      quantity: item.quantity
    }));

    await OrderItem.bulkCreate(itemsToCreate, { transaction: t });

    await t.commit();

    const buyerUser = await User.findByPk(payload.buyerId);
    const buyerName = buyerUser ? buyerUser.name : "Buyer";

    if (payload.orderType === 'RENT') {
      await Notification.create({
        userId: payload.sellerId,
        message: `You have received a new rental request for "${payload.items[0]?.title || "Book"}" from ${buyerName}.`,
        type: "order",
        isRead: false,
      });

      await Notification.create({
        userId: payload.buyerId,
        message: `Your rental request for "${payload.items[0]?.title || "Book"}" has been placed successfully.`,
        type: "order",
        isRead: false,
      });
    } else {
      await Notification.create({
        userId: payload.sellerId,
        message: `New order received from ${payload.shippingName || "Buyer"}`,
        type: "order",
        isRead: false,
      });

      await Notification.create({
        userId: payload.buyerId,
        message: "Order placed successfully",
        type: "order",
        isRead: false,
      });
    }

    const completeOrder = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: 'items' }]
    });

    return res.status(201).json({ order: completeOrder });
  } catch (error) {
    await t.rollback();
    console.error("Order creation failed:", error);
    return res.status(500).json({ msg: "Order creation failed", error: error.message });
  }
};

const getOrders = async (req, res) => {
  const { sellerId, buyerId } = req.query;
  const query = {};

  const isValidId = id => typeof id === 'string' && id.length === 24;
  if (sellerId && isValidId(sellerId)) query.sellerId = sellerId;
  if (buyerId && isValidId(buyerId)) query.buyerId = buyerId;

  const orders = await Order.findAll({
    where: query,
    order: [["createdAt", "DESC"]],
    include: [
      { model: User, as: "buyer", attributes: ["name", "email"] },
      { model: User, as: "seller", attributes: ["name", "email"] },
      { model: OrderItem, as: "items" }
    ]
  });

  const formattedOrders = orders.map(o => {
    const json = o.toJSON();
    if (json.buyer) json.buyerId = json.buyer;
    if (json.seller) json.sellerId = json.seller;
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
                await rent.update({ status: "Reserved" }); // Paid and reserved (pending delivery)
              }
            }
          }
        }
      }
      
      if (order.orderType === "RENT") {
        await Notification.create({
          userId: order.buyerId,
          message: `Your rental request for "${bookTitle}" has been approved by the seller.`,
          type: "order_update",
          orderId: order.id
        });
      } else {
        await Notification.create({ userId: order.buyerId, message: "Your order has been accepted", type: "order_update", orderId: order.id });
      }
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
        await Notification.create({
          userId: order.buyerId,
          message: `Your rental request for "${bookTitle}" has been rejected.`,
          type: "order_update",
          orderId: order.id
        });
      } else {
        await Notification.create({ userId: order.buyerId, message: "Your order has been rejected", type: "order_update", orderId: order.id });
      }
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
      await Notification.create({
        userId: order.sellerId,
        message: `Rental request for "${bookTitle}" was cancelled.`,
        type: "order_update",
        orderId: order.id
      });
      await Notification.create({
        userId: order.buyerId,
        message: `Your rental request for "${bookTitle}" has been cancelled.`,
        type: "order_update",
        orderId: order.id
      });
    } else if (status === "out_for_delivery") {
      const trackNo = order.trackingData?.trackingNumber || 'N/A';
      await Notification.create({ userId: order.buyerId, message: `Your order is out for delivery. Tracking number: ${trackNo}`, type: "order_update", orderId: order.id });
    } else if (status === "payment_submitted") {
      if (order.orderType === "RENT") {
        for (const item of order.items) {
          if (item.bookId) {
            const rent = await Rent.findOne({ where: { bookId: item.bookId } });
            if (rent) {
              await rent.update({ status: "Reserved" }); // Uploaded receipt, waiting approval
            }
          }
        }
        await Notification.create({
          userId: order.buyerId,
          message: `Your payment receipt for rental "${bookTitle}" has been submitted.`,
          type: "order_update",
          orderId: order.id
        });
        await Notification.create({
          userId: order.sellerId,
          message: `Payment receipt uploaded by ${order.shippingName || "Buyer"} for rental "${bookTitle}".`,
          type: "order_update",
          orderId: order.id
        });
      } else {
        await Notification.create({ userId: order.buyerId, message: "Your payment has been submitted", type: "order_update", orderId: order.id });
        await Notification.create({ userId: order.sellerId, message: `${order.shippingName || (order.buyer && order.buyer.name) || "Buyer"} has submitted the payment`, type: "order_update", orderId: order.id });
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

              await Notification.create({
                userId: order.buyerId,
                message: `Your rental for "${item.title}" has started! Active until ${endDate.toLocaleDateString()}.`,
                type: "general"
              });

              await Notification.create({
                userId: order.sellerId,
                message: `Rental has started for "${item.title}". Active until ${endDate.toLocaleDateString()}.`,
                type: "general"
              });
            }
          }
        }
      } else {
        await Notification.create({ userId: order.buyerId, message: "Your order is completed", type: "order_update", orderId: order.id });
        await Notification.create({ userId: order.sellerId, message: "Order completed. Earnings added.", type: "order_update", orderId: order.id });
        
        const earning = order.bookAmount != null ? Number(order.bookAmount) : Number(order.totalAmount);
        
        const seller = await User.findByPk(order.sellerId);
        if (seller) {
          seller.finance_totalEarnings = Number(seller.finance_totalEarnings || 0) + earning;
          seller.finance_monthlyEarnings = Number(seller.finance_monthlyEarnings || 0) + earning;
          seller.finance_completedOrdersRevenue = Number(seller.finance_completedOrdersRevenue || 0) + earning;
          await seller.save();
        }
      }
    } else if (status === "complain") {
      const buyer = await User.findByPk(order.buyerId);
      if (buyer) {
        buyer.complaintCount = (buyer.complaintCount || 0) + 1;
        await buyer.save();
        
        order.status = "complain";
        if (complainReason) order.complainReason = complainReason;
        await order.save();
        
        await Notification.create({ userId: order.sellerId, message: "Your complaint has been received and will be reviewed.", type: "order_update", orderId: order.id });
        const bookName = order.items?.[0]?.title || "Unknown Book";
        const emailMessage = `Seller has raised a complaint on your order for '${bookName}': ${complainReason}`;
        await Notification.create({ userId: order.buyerId, message: emailMessage, type: "complaint", orderId: order.id });
        
        if (buyer.email) {
          sendEmailMock(buyer.email, "Notice: Complaint Received", emailMessage);
        }
        
        if (buyer.complaintCount >= 3) {
          buyer.isBlocked = true;
          await buyer.save();
          await Notification.create({ userId: order.buyerId, message: "Your account has been permanently blocked due to multiple complaints.", type: "system" });
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
