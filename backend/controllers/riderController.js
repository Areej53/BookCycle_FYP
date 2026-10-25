const { User, RiderApplication, Order, OrderItem, Book, Notification, DeliveryStatusHistory, Rent, Exchange, ExchangeRequest, PaymentAuditLog } = require("../models");
const { Op } = require("sequelize");
const { notifyUserAndEmail, notifyAdminUsers, sendSMS } = require("../utils/notificationHelper");

const activeDeliveryStatuses = [
  'ASSIGNED',
  'ACCEPTED',
  'GOING_TO_PICKUP',
  'NEAR_PICKUP',
  'AT_PICKUP',
  'PICKED_UP',
  'GOING_TO_BUYER',
  'OUT_FOR_DELIVERY',
  'NEAR_BUYER',
  'AT_BUYER',
  'EXCHANGED_WITH_BUYER',
  'RENTAL_PERIOD_ACTIVE',
  'RENTAL_EXPIRED',
  'GOING_TO_COLLECT',
  'NEAR_COLLECTION',
  'COLLECTED',
  'RETURNING_TO_SELLER',
  'NEAR_SELLER'
];

const attachRentalInfoToOrder = async (order) => {
  if (!order || order.orderType !== 'RENT' || !order.items) return order;
  for (const item of order.items) {
    if (item.bookId) {
      const rent = await Rent.findOne({ where: { bookId: item.bookId } });
      if (rent && rent.rentalEndDate) {
        const now = new Date();
        const endDate = new Date(rent.rentalEndDate);
        const diffTime = endDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const diffMonths = Math.floor(diffDays / 30);
        const remainingDays = diffDays % 30;
        
        let timeRemaining = '';
        if (diffDays <= 0) {
          timeRemaining = 'Expired';
        } else if (diffMonths > 0) {
          timeRemaining = diffMonths === 1 ? '1 month' : `${diffMonths} months`;
          if (remainingDays > 0) {
            timeRemaining += ` ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
          }
        } else {
          timeRemaining = `${diffDays} day${diffDays > 1 ? 's' : ''}`;
        }
        
        let deliveryDate = rent.rentalStartDate;
        if (order.trackingData) {
          try {
            const trackingData = typeof order.trackingData === 'string' 
              ? JSON.parse(order.trackingData) 
              : order.trackingData;
            if (trackingData && trackingData.deliveryDate) {
              deliveryDate = new Date(trackingData.deliveryDate);
            }
          } catch (e) {}
        }
        
        const info = {
          rentalDuration: rent.rentalDuration,
          rentalStartDate: rent.rentalStartDate,
          rentalEndDate: rent.rentalEndDate,
          deliveryDate: deliveryDate,
          timeRemaining,
          daysRemaining: diffDays > 0 ? diffDays : 0,
          isExpired: diffTime <= 0
        };
        
        if (item.dataValues) item.dataValues.rentalInfo = info;
        item.rentalInfo = info;
        if (order.dataValues) order.dataValues.rentalInfo = info;
        order.rentalInfo = info;
      }
    }
  }
  return order;
};

const getRiderDashboardStats = async (req, res) => {
  try {
    const riderId = req.user.id;

    const application = await RiderApplication.findOne({ where: { userId: riderId } });

    const inTransitStatuses = [
      'ASSIGNED',
      'ACCEPTED',
      'GOING_TO_PICKUP',
      'NEAR_PICKUP',
      'AT_PICKUP',
      'PICKED_UP',
      'GOING_TO_BUYER',
      'OUT_FOR_DELIVERY',
      'NEAR_BUYER',
      'AT_BUYER',
      'EXCHANGED_WITH_BUYER',
      'RENTAL_EXPIRED',
      'GOING_TO_COLLECT',
      'NEAR_COLLECTION',
      'COLLECTED',
      'RETURNING_TO_SELLER',
      'NEAR_SELLER'
    ];

    const [totalAssigned, pendingDeliveries, completedDeliveries, activeDeliveryOrder, activeRentalOrders] = await Promise.all([
      Order.count({ where: { riderId } }),
      Order.count({ where: { riderId, deliveryStatus: { [Op.in]: activeDeliveryStatuses } } }),
      Order.count({ where: { riderId, deliveryStatus: { [Op.in]: ['DELIVERED', 'RETURNED'] } } }),
      Order.findOne({
        where: {
          riderId,
          deliveryStatus: { [Op.in]: inTransitStatuses }
        },
        include: [
          { model: User, as: 'buyer', attributes: ['id', 'name', 'email', 'phone', 'address', 'city'] },
          { model: User, as: 'seller', attributes: ['id', 'name', 'email', 'phone', 'address', 'city', 'pickupAddress'] },
          {
            model: OrderItem,
            as: 'items',
            include: [{ model: Book, as: 'book', attributes: ['id', 'title', 'image', 'price'] }]
          },
          { model: DeliveryStatusHistory, as: 'statusHistory' }
        ],
        order: [['updatedAt', 'DESC']]
      }),
      Order.findAll({
        where: {
          riderId,
          orderType: 'RENT',
          deliveryStatus: { [Op.in]: ['RENTAL_PERIOD_ACTIVE', 'RENTAL_EXPIRED'] }
        },
        include: [
          { model: User, as: 'buyer', attributes: ['id', 'name', 'email', 'phone', 'address', 'city'] },
          { model: User, as: 'seller', attributes: ['id', 'name', 'email', 'phone', 'address', 'city', 'pickupAddress'] },
          {
            model: OrderItem,
            as: 'items',
            include: [{ model: Book, as: 'book', attributes: ['id', 'title', 'image', 'price'] }]
          },
          { model: DeliveryStatusHistory, as: 'statusHistory' }
        ],
        order: [['updatedAt', 'DESC']]
      })
    ]);

    if (activeDeliveryOrder) {
      await attachRentalInfoToOrder(activeDeliveryOrder);
    }
    if (activeRentalOrders && activeRentalOrders.length > 0) {
      for (const rentOrder of activeRentalOrders) {
        await attachRentalInfoToOrder(rentOrder);
      }
    }

    // Default primary active order to in-transit delivery; if none, show the first active rental order
    const primaryActive = activeDeliveryOrder || (activeRentalOrders && activeRentalOrders.length > 0 ? activeRentalOrders[0] : null);

    res.status(200).json({
      totalAssigned,
      pendingDeliveries,
      completedDeliveries,
      activeDelivery: primaryActive,
      activeRental: (activeRentalOrders && activeRentalOrders.length > 0) ? activeRentalOrders[0] : null,
      activeRentals: activeRentalOrders || [],
      isRiderActive: application ? application.isRiderActive : true,
      riderStatus: application ? application.status : 'PENDING'
    });
  } catch (error) {
    console.error('Get Rider Dashboard Stats error:', error);
    res.status(500).json({ msg: 'Failed to fetch rider stats.' });
  }
};

const getAssignedOrders = async (req, res) => {
  try {
    const riderId = req.user.id;

    const orders = await Order.findAll({
      where: { riderId },
      include: [
        { model: User, as: 'buyer', attributes: ['id', 'name', 'email', 'phone', 'address', 'city'] },
        { model: User, as: 'seller', attributes: ['id', 'name', 'email', 'phone', 'address', 'city', 'pickupAddress'] },
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Book, as: 'book', attributes: ['id', 'title', 'image', 'price', 'category'] }]
        },
        { model: DeliveryStatusHistory, as: 'statusHistory' },
        { model: PaymentAuditLog, as: 'paymentHistory' }
      ],
      order: [['createdAt', 'DESC']]
    });

    for (const order of orders) {
      await attachRentalInfoToOrder(order);
    }

    res.status(200).json({ orders });
  } catch (error) {
    console.error('Get Assigned Orders error:', error);
    res.status(500).json({ msg: 'Failed to fetch assigned orders.' });
  }
};

const getActiveDelivery = async (req, res) => {
  try {
    const riderId = req.user.id;

    const activeOrder = await Order.findOne({
      where: {
        riderId,
        deliveryStatus: { [Op.in]: activeDeliveryStatuses }
      },
      include: [
        { model: User, as: 'buyer', attributes: ['id', 'name', 'email', 'phone', 'address', 'city'] },
        { model: User, as: 'seller', attributes: ['id', 'name', 'email', 'phone', 'address', 'city', 'pickupAddress'] },
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Book, as: 'book', attributes: ['id', 'title', 'image', 'price'] }]
        },
        { model: DeliveryStatusHistory, as: 'statusHistory' },
        { model: PaymentAuditLog, as: 'paymentHistory' }
      ],
      order: [['updatedAt', 'DESC']]
    });

    if (activeOrder) {
      await attachRentalInfoToOrder(activeOrder);
    }

    res.status(200).json({ activeDelivery: activeOrder });
  } catch (error) {
    console.error('Get Active Delivery error:', error);
    res.status(500).json({ msg: 'Failed to fetch active delivery.' });
  }
};

const updateDeliveryStatus = async (req, res) => {
  try {
    const riderId = req.user.id;
    const { orderId } = req.params;
    const { nextStatus } = req.body;

    const validStatuses = [
      'ACCEPTED',
      'GOING_TO_PICKUP',
      'NEAR_PICKUP',
      'AT_PICKUP',
      'PICKED_UP',
      'GOING_TO_BUYER',
      'OUT_FOR_DELIVERY',
      'NEAR_BUYER',
      'AT_BUYER',
      'DELIVERED',
      'EXCHANGED_WITH_BUYER',
      'RENTAL_EXPIRED',
      'GOING_TO_COLLECT',
      'NEAR_COLLECTION',
      'COLLECTED',
      'RETURNING_TO_SELLER',
      'NEAR_SELLER',
      'RETURNED'
    ];

    if (!validStatuses.includes(nextStatus)) {
      return res.status(400).json({ msg: 'Invalid delivery status.' });
    }

    const order = await Order.findOne({
      where: { id: orderId, riderId },
      include: [
        { model: User, as: 'buyer', attributes: ['id', 'name', 'email', 'phone', 'address', 'city'] },
        { model: User, as: 'seller', attributes: ['id', 'name', 'email', 'phone', 'address', 'city', 'pickupAddress'] },
        { model: OrderItem, as: 'items' }
      ]
    });

    if (!order) {
      return res.status(404).json({ msg: 'Order not found or not assigned to you.' });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ msg: 'Cannot update delivery status for a cancelled order.' });
    }

    const currentStatus = order.deliveryStatus || 'ASSIGNED';
    console.log(`[Status Update] Order ID: ${orderId}, Current Status: ${currentStatus}, Next Status: ${nextStatus}, Order Type: ${order.orderType}`);

    // Allow sequential transitions while supporting direct updates if needed
    const statusFlow = {
      'UNASSIGNED': ['ASSIGNED'],
      'ASSIGNED': ['ACCEPTED'],
      'ACCEPTED': ['GOING_TO_PICKUP', 'NEAR_PICKUP', 'PICKED_UP'],
      'GOING_TO_PICKUP': ['NEAR_PICKUP', 'AT_PICKUP', 'PICKED_UP'],
      'NEAR_PICKUP': ['AT_PICKUP', 'PICKED_UP'],
      'AT_PICKUP': ['PICKED_UP'],
      'PICKED_UP': ['GOING_TO_BUYER', 'OUT_FOR_DELIVERY', 'NEAR_BUYER', 'DELIVERED', 'EXCHANGED_WITH_BUYER'],
      'GOING_TO_BUYER': ['NEAR_BUYER', 'AT_BUYER', 'DELIVERED', 'EXCHANGED_WITH_BUYER'],
      'OUT_FOR_DELIVERY': ['NEAR_BUYER', 'AT_BUYER', 'DELIVERED', 'EXCHANGED_WITH_BUYER'],
      'NEAR_BUYER': ['AT_BUYER', 'DELIVERED', 'EXCHANGED_WITH_BUYER'],
      'AT_BUYER': ['DELIVERED', 'EXCHANGED_WITH_BUYER'],
      'EXCHANGED_WITH_BUYER': ['RETURNING_TO_SELLER', 'NEAR_SELLER'],
      'DELIVERED': [],
      'RENTAL_PERIOD_ACTIVE': ['RENTAL_EXPIRED', 'GOING_TO_COLLECT'],
      'RENTAL_EXPIRED': ['GOING_TO_COLLECT'],
      'GOING_TO_COLLECT': ['NEAR_COLLECTION', 'COLLECTED'],
      'NEAR_COLLECTION': ['COLLECTED'],
      'COLLECTED': ['RETURNING_TO_SELLER'],
      'RETURNING_TO_SELLER': ['NEAR_SELLER', 'RETURNED'],
      'NEAR_SELLER': ['RETURNED'],
      'RETURNED': []
    };

    const allowed = statusFlow[currentStatus] || [];
    if (!allowed.includes(nextStatus) && currentStatus !== nextStatus) {
      console.log(`[Status Transition Error] Current: ${currentStatus}, Next: ${nextStatus}, Allowed: ${allowed.join(', ')}`);
      return res.status(400).json({ 
        msg: `Cannot transition from ${currentStatus} to ${nextStatus}. Allowed next status: ${allowed.join(', ') || 'None'}` 
      });
    }

    // Check duplicate transition to avoid double notifications on page refresh / re-clicks
    if (currentStatus === nextStatus) {
      return res.status(200).json({ msg: `Delivery status is already ${nextStatus}.`, order });
    }

    // If order is currently in active rental period, verify that countdown/rental period has ended
    if (currentStatus === 'RENTAL_PERIOD_ACTIVE') {
      let isRentalEnded = false;
      for (const item of order.items) {
        if (item.bookId) {
          const rent = await Rent.findOne({ where: { bookId: item.bookId } });
          if (rent && rent.rentalEndDate && new Date(rent.rentalEndDate).getTime() <= Date.now()) {
            isRentalEnded = true;
            break;
          }
        }
      }
      if (!isRentalEnded) {
        return res.status(400).json({ 
          msg: 'Rental period is still active. Return delivery progress can only be managed when the rental period reaches zero.' 
        });
      }
    }

    // 1. UPDATE DATABASE FIRST
    order.deliveryStatus = nextStatus;

    if (nextStatus === 'GOING_TO_BUYER' || nextStatus === 'OUT_FOR_DELIVERY' || nextStatus === 'EXCHANGED_WITH_BUYER') {
      order.status = 'out_for_delivery';
    } else if (nextStatus === 'GOING_TO_COLLECT' || nextStatus === 'NEAR_COLLECTION' || nextStatus === 'COLLECTED' || nextStatus === 'RETURNING_TO_SELLER' || nextStatus === 'NEAR_SELLER') {
      order.status = 'out_for_delivery';
    } else if (nextStatus === 'RETURNED') {
      order.status = 'completed';
    } else if (nextStatus === 'DELIVERED') {
      if (order.orderType === 'BUY') {
        order.status = 'completed';
        const earning = order.bookAmount != null ? Number(order.bookAmount) : Number(order.totalAmount);
        const seller = await User.findByPk(order.sellerId);
        if (seller) {
          seller.finance_totalEarnings = Number(seller.finance_totalEarnings || 0) + earning;
          seller.finance_monthlyEarnings = Number(seller.finance_monthlyEarnings || 0) + earning;
          seller.finance_completedOrdersRevenue = Number(seller.finance_completedOrdersRevenue || 0) + earning;
          await seller.save();
        }
      } else if (order.orderType === 'RENT') {
        order.status = 'rental_active';
        order.deliveryStatus = 'RENTAL_PERIOD_ACTIVE';
        const deliveryDate = new Date();
        // Store delivery date in trackingData
        const trackingData = order.trackingData ? JSON.parse(order.trackingData) : {};
        trackingData.deliveryDate = deliveryDate.toISOString();
        order.trackingData = JSON.stringify(trackingData);
        
        for (const item of order.items) {
          if (item.bookId) {
            const rent = await Rent.findOne({ where: { bookId: item.bookId } });
            if (rent) {
              const startDate = deliveryDate;
              const endDate = new Date(deliveryDate);
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
            }
          }
        }
      } else {
        order.status = 'delivered';
      }
    } else if (nextStatus === 'ACCEPTED' || nextStatus === 'GOING_TO_PICKUP' || nextStatus === 'NEAR_PICKUP' || nextStatus === 'PICKED_UP') {
      order.status = 'ride_assigned';
    }

    await order.save();

    // 2. RECORD HISTORY IN DATABASE
    try {
      await DeliveryStatusHistory.create({
        orderId: order.id,
        riderId: riderId,
        status: nextStatus,
        updatedBy: riderId
      });
    } catch (histErr) {
      console.error("Delivery status history create error:", histErr);
    }

    // 3. TRIGGER NOTIFICATIONS & EMAILS & SMS
    const riderUser = await User.findByPk(riderId);
    const riderName = riderUser ? riderUser.name : "Rider";
    const sellerName = order.seller ? order.seller.name : "Seller";

    // RENTAL EXPIRED NOTIFICATIONS
    if (nextStatus === 'RENTAL_EXPIRED') {
      // No email notifications - reducing spam
    }

    // RENTAL COLLECTION NOTIFICATIONS
    if (nextStatus === 'GOING_TO_COLLECT') {
      // No email notifications - reducing spam
    }

    if (nextStatus === 'NEAR_COLLECTION') {
      if (order.buyerId) {
        await notifyUserAndEmail({
          userId: order.buyerId,
          userEmail: order.buyer?.email,
          userPhone: order.shippingPhone || order.buyer?.phone,
          subject: `Rider Arriving Soon to Collect - Order #${order.id}`,
          message: `Rider ${riderName} is arriving soon to collect the rented book for Order #${order.id}.`,
          type: 'order_update',
          orderId: order.id,
          sendSmsFlag: true
        });
      }
    }

    if (nextStatus === 'COLLECTED') {
      // No email notifications - reducing spam
    }

    if (nextStatus === 'EXCHANGED_WITH_BUYER') {
      if (order.buyerId) {
        await notifyUserAndEmail({
          userId: order.buyerId,
          userEmail: order.buyer?.email,
          userPhone: order.shippingPhone || order.buyer?.phone,
          subject: `Exchange Book Handed Over - Order #${order.id}`,
          message: `Rider ${riderName} delivered the seller's book to you and collected your exchange book for Order #${order.id}. The rider is now heading to the seller to complete the exchange.`,
          type: 'order_update',
          orderId: order.id,
          sendSmsFlag: true
        });
      }
      if (order.sellerId) {
        await notifyUserAndEmail({
          userId: order.sellerId,
          userEmail: order.seller?.email,
          userPhone: order.seller?.phone,
          subject: `Exchange in Progress: Book Delivered to Buyer - Order #${order.id}`,
          message: `Rider ${riderName} has delivered your book to the buyer and collected the buyer's exchange book for Order #${order.id}. The rider is now on the way to your pickup address with the exchange book.`,
          type: 'order_update',
          orderId: order.id
        });
      }
      await notifyAdminUsers({
        subject: `Exchange Progress - Order #${order.id}`,
        message: `Rider ${riderName} delivered book to buyer and collected exchange book for Order #${order.id}. Now returning to seller.`,
        orderId: order.id
      });
    }

    if (nextStatus === 'NEAR_SELLER') {
      if (order.sellerId) {
        const nearMsg = order.orderType === 'EXCHANGE'
          ? `Rider ${riderName} is arriving soon with the buyer's exchange book for Order #${order.id}.`
          : `Rider ${riderName} is arriving soon to return your rented book for Order #${order.id}.`;
        await notifyUserAndEmail({
          userId: order.sellerId,
          userEmail: order.seller?.email,
          userPhone: order.seller?.phone,
          subject: `Rider Arriving Soon - Order #${order.id}`,
          message: nearMsg,
          type: 'order_update',
          orderId: order.id,
          sendSmsFlag: true
        });
      }
    }

    if (nextStatus === 'RETURNED') {
      if (order.orderType === 'EXCHANGE') {
        if (order.sellerId) {
          await notifyUserAndEmail({
            userId: order.sellerId,
            userEmail: order.seller?.email,
            userPhone: order.seller?.phone,
            subject: `Book Exchange Completed - Order #${order.id}`,
            message: `Your book exchange is complete! Rider ${riderName} has delivered the exchange book from the buyer to your address. Order #${order.id} is now complete.`,
            type: 'order_update',
            orderId: order.id
          });
        }
        if (order.buyerId) {
          await notifyUserAndEmail({
            userId: order.buyerId,
            userEmail: order.buyer?.email,
            userPhone: order.shippingPhone || order.buyer?.phone,
            subject: `Book Exchange Completed - Order #${order.id}`,
            message: `Your book exchange for Order #${order.id} is complete! Both books have been safely delivered to their respective owners.`,
            type: 'order_update',
            orderId: order.id
          });
        }
        await notifyAdminUsers({
          subject: `Exchange Completed - Order #${order.id}`,
          message: `Rider ${riderName} successfully completed two-way book exchange for Order #${order.id}.`,
          orderId: order.id
        });

        // Mark exchange listing(s) as completed
        for (const item of order.items) {
          if (item.bookId) {
            const ex = await Exchange.findOne({ where: { bookId: item.bookId } });
            if (ex) {
              await ex.update({ status: 'Completed' });
            }
          }
        }
        if (ExchangeRequest) {
          const exReq = await ExchangeRequest.findOne({
            where: {
              requesterId: order.buyerId,
              ownerId: order.sellerId,
              status: { [Op.in]: ['Accepted', 'InDelivery'] }
            }
          });
          if (exReq) {
            await exReq.update({ status: 'Completed' });
          }
        }
      } else {
        if (order.sellerId) {
          await notifyUserAndEmail({
            userId: order.sellerId,
            userEmail: order.seller?.email,
            userPhone: order.seller?.phone,
            subject: `Book Returned Successfully - Order #${order.id}`,
            message: `Your rented book for Order #${order.id} has been returned successfully.`,
            type: 'order_update',
            orderId: order.id
          });
        }
        if (order.buyerId) {
          await notifyUserAndEmail({
            userId: order.buyerId,
            userEmail: order.buyer?.email,
            userPhone: order.shippingPhone || order.buyer?.phone,
            subject: `Book Returned - Order #${order.id}`,
            message: `The rented book for Order #${order.id} has been returned to the seller.`,
            type: 'order_update',
            orderId: order.id
          });
        }
        await notifyAdminUsers({
          subject: `Book Returned - Order #${order.id}`,
          message: `Rider ${riderName} returned the rented book for Order #${order.id}. Order completed.`,
          orderId: order.id
        });
        
        // Mark rent as available again
        for (const item of order.items) {
          if (item.bookId) {
            const rent = await Rent.findOne({ where: { bookId: item.bookId } });
            if (rent) {
              await rent.update({ status: "Available" });
            }
            const book = await Book.findByPk(item.bookId);
            if (book) {
              await book.update({ status: "Available" });
            }
          }
        }
      }
      
      // Complete the order
      order.status = 'completed';
      await order.save();
    }

    if (nextStatus === 'ACCEPTED') {
      // ADMIN
      await notifyAdminUsers({
        subject: `Rider Accepted Order #${order.id}`,
        message: `Rider ${riderName} accepted Order #${order.id}.`,
        orderId: order.id
      });
      // SELLER
      if (order.sellerId) {
        await notifyUserAndEmail({
          userId: order.sellerId,
          userEmail: order.seller?.email,
          userPhone: order.seller?.phone,
          subject: `Rider Accepted Pickup - Order #${order.id}`,
          message: `Rider ${riderName} has accepted the pickup for Order #${order.id}.`,
          type: 'order_update',
          orderId: order.id
        });
      }
      // BUYER
      if (order.buyerId) {
        await notifyUserAndEmail({
          userId: order.buyerId,
          userEmail: order.buyer?.email,
          userPhone: order.shippingPhone || order.buyer?.phone,
          subject: `Rider Accepted - Order #${order.id}`,
          message: `Rider ${riderName} has accepted your BookCycle order #${order.id} and will collect the book from the seller.`,
          type: 'order_update',
          orderId: order.id,
          sendSmsFlag: true
        });
      }
    } else if (nextStatus === 'GOING_TO_PICKUP') {
      // No email notifications - reducing spam
    } else if (nextStatus === 'NEAR_PICKUP') {
      // No email notifications - reducing spam
    } else if (nextStatus === 'PICKED_UP') {
      // No email notifications - reducing spam
    } else if (nextStatus === 'GOING_TO_BUYER' || nextStatus === 'OUT_FOR_DELIVERY') {
      // No email notifications - reducing spam
    } else if (nextStatus === 'NEAR_BUYER') {
      if (order.buyerId) {
        await notifyUserAndEmail({
          userId: order.buyerId,
          userEmail: order.buyer?.email,
          userPhone: order.shippingPhone || order.buyer?.phone,
          subject: `Rider Arriving Soon - Order #${order.id}`,
          message: `Your BookCycle Rider is arriving soon with Order #${order.id}.`,
          type: 'order_update',
          orderId: order.id,
          sendSmsFlag: true
        });
      }
      await notifyAdminUsers({
        subject: `Rider Near Buyer - Order #${order.id}`,
        message: `Rider ${riderName} is near the buyer for Order #${order.id}.`,
        orderId: order.id
      });
    } else if (nextStatus === 'DELIVERED') {
      // BUYER
      if (order.buyerId) {
        await notifyUserAndEmail({
          userId: order.buyerId,
          userEmail: order.buyer?.email,
          userPhone: order.shippingPhone || order.buyer?.phone,
          subject: `Order Delivered Successfully - Order #${order.id}`,
          message: `Your BookCycle order #${order.id} has been delivered successfully.`,
          type: 'order_update',
          orderId: order.id,
          sendSmsFlag: true
        });
      }
      // SELLER
      if (order.sellerId) {
        await notifyUserAndEmail({
          userId: order.sellerId,
          userEmail: order.seller?.email,
          userPhone: order.seller?.phone,
          subject: `Order Delivered - Order #${order.id}`,
          message: `Order #${order.id} has been successfully delivered to the buyer.`,
          type: 'order_update',
          orderId: order.id
        });
      }
      // ADMIN
      await notifyAdminUsers({
        subject: `Order Delivered - Order #${order.id}`,
        message: `Order #${order.id} has been successfully delivered by Rider ${riderName}.`,
        orderId: order.id
      });
    }

    res.status(200).json({ 
      msg: `Delivery status updated to ${nextStatus} successfully.`, 
      order 
    });
  } catch (error) {
    console.error('Update Delivery Status error:', error);
    res.status(500).json({ msg: 'Failed to update delivery status.' });
  }
};

const confirmCodCollection = async (req, res) => {
  try {
    const riderId = req.user.id;
    const { orderId } = req.params;
    const { collectedAmount, discrepancyReason, note } = req.body;

    const order = await Order.findByPk(orderId, {
      include: [
        { model: User, as: 'buyer' },
        { model: User, as: 'seller' },
        { model: OrderItem, as: 'items' },
        { model: PaymentAuditLog, as: 'paymentHistory' }
      ]
    });

    if (!order) {
      return res.status(404).json({ msg: 'Order not found.' });
    }

    // Role & assignment verification: must be the assigned rider
    if (order.riderId !== riderId) {
      return res.status(403).json({ msg: 'Unauthorized: You are not the assigned rider for this delivery.' });
    }

    // Prevent duplicate collection
    if (order.paymentStatus === 'COD_COLLECTED' || order.paymentStatus === 'DEPOSITED' || order.paymentStatus === 'SETTLED') {
      return res.status(400).json({ msg: `Payment collection has already been recorded as ${order.paymentStatus}.` });
    }

    const expectedAmount = Number(order.codAmountDue || order.totalAmount) || 0;
    const actualCollected = Number(collectedAmount);

    if (isNaN(actualCollected) || actualCollected < 0) {
      return res.status(400).json({ msg: 'Please provide a valid cash collected amount.' });
    }

    // Check for discrepancy between expected and collected
    const diff = Math.abs(actualCollected - expectedAmount);
    const hasDiscrepancy = diff > 0.01;

    const previousStatus = order.paymentStatus || 'COD_PENDING';
    const newStatus = hasDiscrepancy ? 'DEPOSIT_PENDING' : 'COD_COLLECTED';

    order.codAmountCollected = actualCollected;
    order.codCollectedAt = new Date();
    order.codCollectedBy = riderId;
    order.depositStatus = 'PENDING';
    order.paymentStatus = newStatus;

    if (hasDiscrepancy) {
      order.hasDiscrepancy = true;
      order.discrepancyReason = discrepancyReason || `Amount discrepancy: Expected Rs. ${expectedAmount}, Rider collected Rs. ${actualCollected}. ${note || ''}`.trim();
      order.discrepancyResolved = false;
    } else {
      order.hasDiscrepancy = false;
      order.discrepancyReason = null;
    }

    await order.save();

    // Record in PaymentAuditLog
    await PaymentAuditLog.create({
      orderId: order.id,
      action: hasDiscrepancy ? 'DISCREPANCY_FLAGGED' : 'COD_COLLECTED',
      amount: actualCollected,
      performedBy: riderId,
      performedByRole: 'rider',
      previousPaymentStatus: previousStatus,
      newPaymentStatus: newStatus,
      note: hasDiscrepancy 
        ? `Rider reported cash discrepancy: Expected Rs. ${expectedAmount}, Collected Rs. ${actualCollected}. Reason: ${order.discrepancyReason}` 
        : `Rider confirmed cash collection of Rs. ${actualCollected} from customer on delivery.`
    });

    // Notify Admin
    await notifyAdminUsers({
      subject: hasDiscrepancy ? `⚠️ COD Collection Discrepancy - Order #${order.id}` : `COD Cash Collected - Order #${order.id}`,
      message: hasDiscrepancy
        ? `Rider collected Rs. ${actualCollected} instead of expected Rs. ${expectedAmount} for Order #${order.id}. Requires Admin review.`
        : `Rider confirmed collection of Rs. ${actualCollected} COD payment for Order #${order.id}. Cash is pending deposit with Admin.`,
      orderId: order.id
    });

    // Notify Buyer
    if (order.buyerId) {
      await notifyUserAndEmail({
        userId: order.buyerId,
        userEmail: order.buyer?.email,
        userPhone: order.shippingPhone || order.buyer?.phone,
        subject: `Payment Receipt Confirmed - Order #${order.id}`,
        message: `Your Cash on Delivery payment of Rs. ${actualCollected} has been confirmed by the rider for Order #${order.id}. Thank you!`,
        type: "payment",
        orderId: order.id,
        sendSmsFlag: true
      });
    }

    const reloadedOrder = await Order.findByPk(orderId, {
      include: [
        { model: User, as: 'buyer' },
        { model: User, as: 'seller' },
        { model: OrderItem, as: 'items' },
        { model: DeliveryStatusHistory, as: 'statusHistory' },
        { model: PaymentAuditLog, as: 'paymentHistory' }
      ]
    });

    res.status(200).json({
      msg: hasDiscrepancy 
        ? `Cash collection recorded with discrepancy (Rs. ${actualCollected} vs expected Rs. ${expectedAmount}). Flagged for Admin review.`
        : `Cash collection of Rs. ${actualCollected} confirmed successfully.`,
      order: reloadedOrder ? reloadedOrder.toJSON() : order.toJSON()
    });
  } catch (error) {
    console.error('Confirm COD Collection error:', error);
    res.status(500).json({ msg: 'Failed to confirm cash collection.', error: error.message });
  }
};

const getRiderProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'phone', 'address', 'city', 'role', 'createdAt']
    });

    if (!user) {
      return res.status(404).json({ msg: 'User profile not found.' });
    }

    let application = await RiderApplication.findOne({ where: { userId } });

    if (!application && user.phone) {
      application = await RiderApplication.findOne({ where: { phone: user.phone } });
      if (application && !application.userId) {
        application.userId = userId;
        await application.save();
      }
    }

    if (!application && user.name) {
      application = await RiderApplication.findOne({ where: { fullName: user.name } });
      if (application && !application.userId) {
        application.userId = userId;
        await application.save();
      }
    }

    res.status(200).json({
      user,
      application: application || null
    });
  } catch (error) {
    console.error('Get Rider Profile error:', error);
    res.status(500).json({ msg: 'Failed to fetch rider profile.' });
  }
};

const toggleOwnAvailability = async (req, res) => {
  try {
    const userId = req.user.id;
    let application = await RiderApplication.findOne({ where: { userId } });

    if (!application) {
      const user = await User.findByPk(userId);
      if (user?.phone) {
        application = await RiderApplication.findOne({ where: { phone: user.phone } });
      }
      if (!application && user?.name) {
        application = await RiderApplication.findOne({ where: { fullName: user.name } });
      }
      if (application && !application.userId) {
        application.userId = userId;
      }
    }

    if (!application) {
      return res.status(404).json({ msg: 'Rider application record not found.' });
    }

    application.isRiderActive = !application.isRiderActive;
    await application.save();

    res.status(200).json({
      msg: `Rider availability set to ${application.isRiderActive ? 'ACTIVE' : 'INACTIVE'}`,
      isRiderActive: application.isRiderActive,
      application
    });
  } catch (error) {
    console.error('Toggle Own Availability error:', error);
    res.status(500).json({ msg: 'Failed to update availability.' });
  }
};

// ADMIN CONTROLLERS

const getAllApprovedRiders = async (req, res) => {
  try {
    const applications = await RiderApplication.findAll({
      where: { status: 'APPROVED' },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone', 'address', 'city', 'role', 'createdAt']
        }
      ],
      order: [['updatedAt', 'DESC']]
    });

    // Attach order counts to each approved rider
    const ridersWithStats = await Promise.all(
      applications.map(async (app) => {
        const appJson = app.toJSON();
        const activeOrders = await Order.findAll({
          where: {
            riderId: app.userId,
            deliveryStatus: { [Op.in]: activeDeliveryStatuses }
          },
          include: [{ model: OrderItem, as: 'items' }]
        });

        let activeCount = 0;
        for (const actOrder of activeOrders) {
          if (actOrder.orderType === 'RENT') {
            if (actOrder.deliveryStatus === 'RENTAL_PERIOD_ACTIVE') {
              continue;
            }
            let hasTimeRemaining = false;
            if (actOrder.items && actOrder.items.length > 0) {
              for (const itm of actOrder.items) {
                if (itm.bookId) {
                  const rentRecord = await Rent.findOne({ where: { bookId: itm.bookId } });
                  if (rentRecord && rentRecord.rentalEndDate) {
                    const diffTime = new Date(rentRecord.rentalEndDate) - new Date();
                    if (diffTime > 0) {
                      hasTimeRemaining = true;
                      break;
                    }
                  }
                }
              }
            }
            const collectionTransitStatuses = [
              'GOING_TO_COLLECT',
              'NEAR_COLLECTION',
              'COLLECTED',
              'RETURNING_TO_SELLER',
              'NEAR_SELLER'
            ];
            if (hasTimeRemaining && !collectionTransitStatuses.includes(actOrder.deliveryStatus)) {
              continue;
            }
          }
          activeCount++;
        }

        const [assignedCount, completedCount] = await Promise.all([
          Order.count({ where: { riderId: app.userId } }),
          Order.count({ where: { riderId: app.userId, deliveryStatus: { [Op.in]: ['DELIVERED', 'RETURNED'] } } })
        ]);

        return {
          ...appJson,
          assignedCount,
          completedCount,
          activeCount
        };
      })
    );

    res.status(200).json({ riders: ridersWithStats });
  } catch (error) {
    console.error('Get All Approved Riders error:', error);
    res.status(500).json({ msg: 'Failed to fetch approved riders.' });
  }
};

const toggleRiderActiveStatus = async (req, res) => {
  try {
    const { riderUserId } = req.params;
    const { isActive } = req.body;

    const application = await RiderApplication.findOne({ where: { userId: riderUserId } });
    if (!application) {
      return res.status(404).json({ msg: 'Rider application not found.' });
    }

    application.isRiderActive = Boolean(isActive);
    await application.save();

    res.status(200).json({
      msg: `Rider status updated to ${application.isRiderActive ? 'ACTIVE' : 'INACTIVE'} successfully.`,
      isRiderActive: application.isRiderActive,
      application
    });
  } catch (error) {
    console.error('Toggle Rider Active Status error:', error);
    res.status(500).json({ msg: 'Failed to update rider status.' });
  }
};

const assignRiderToOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { riderUserId } = req.body;

    // Verify order
    const order = await Order.findByPk(orderId, {
      include: [
        { model: User, as: 'buyer', attributes: ['id', 'name', 'email', 'phone', 'address', 'city'] },
        { model: User, as: 'seller', attributes: ['id', 'name', 'email', 'phone', 'address', 'city', 'pickupAddress'] }
      ]
    });
    if (!order) {
      return res.status(404).json({ msg: 'Order not found.' });
    }

    if (order.status === 'cancelled' || order.status === 'delivered' || order.status === 'completed' || order.status === 'rejected') {
      return res.status(400).json({ msg: `Cannot assign rider to an order that is ${order.status}.` });
    }

    // If order already has a rider (reassignment), use the original rider automatically
    let actualRiderId = riderUserId;
    if (order.riderId) {
      actualRiderId = order.riderId;
    }

    if (!actualRiderId) {
      return res.status(400).json({ msg: 'Rider user ID is required.' });
    }

    // Verify Rider is approved and active
    const riderApp = await RiderApplication.findOne({ where: { userId: actualRiderId } });
    if (!riderApp || riderApp.status !== 'APPROVED') {
      return res.status(400).json({ msg: 'Selected user is not an approved Rider.' });
    }

    if (!riderApp.isRiderActive) {
      return res.status(400).json({ msg: 'Selected Rider is currently INACTIVE and cannot receive assignments.' });
    }

    // Check if rider has any active deliveries that are currently in progress.
    // NOTE: Active rental orders where rental time is still remaining (e.g. RENTAL_PERIOD_ACTIVE
    // or rentalEndDate has time remaining) do NOT block the rider from receiving new assignments.
    const activeOrders = await Order.findAll({
      where: {
        riderId: actualRiderId,
        id: { [Op.ne]: order.id },
        deliveryStatus: { [Op.in]: activeDeliveryStatuses }
      },
      include: [
        {
          model: OrderItem,
          as: 'items'
        }
      ]
    });

    let hasBlockingDelivery = false;
    for (const actOrder of activeOrders) {
      if (actOrder.orderType === 'RENT') {
        // If deliveryStatus is RENTAL_PERIOD_ACTIVE, the book is with the buyer and timer is running: NOT blocking!
        if (actOrder.deliveryStatus === 'RENTAL_PERIOD_ACTIVE') {
          continue;
        }

        // Check if rental period still has time remaining via Rent record
        let hasTimeRemaining = false;
        if (actOrder.items && actOrder.items.length > 0) {
          for (const itm of actOrder.items) {
            if (itm.bookId) {
              const rentRecord = await Rent.findOne({ where: { bookId: itm.bookId } });
              if (rentRecord && rentRecord.rentalEndDate) {
                const diffTime = new Date(rentRecord.rentalEndDate) - new Date();
                if (diffTime > 0) {
                  hasTimeRemaining = true;
                  break;
                }
              }
            }
          }
        }

        const collectionTransitStatuses = [
          'GOING_TO_COLLECT',
          'NEAR_COLLECTION',
          'COLLECTED',
          'RETURNING_TO_SELLER',
          'NEAR_SELLER'
        ];
        // If time is remaining and the rider is not on a physical collection trip, it does NOT block!
        if (hasTimeRemaining && !collectionTransitStatuses.includes(actOrder.deliveryStatus)) {
          continue;
        }
      }

      // Any non-rent active delivery or expired collection trip blocks assignment
      hasBlockingDelivery = true;
      break;
    }

    if (hasBlockingDelivery) {
      return res.status(400).json({ msg: 'Selected Rider already has an active delivery and cannot receive new assignments.' });
    }

    // 1. UPDATE DATABASE FIRST
    order.riderId = actualRiderId;
    order.deliveryStatus = 'ASSIGNED';
    order.status = 'ride_assigned';
    await order.save();

    // 2. RECORD HISTORY
    try {
      await DeliveryStatusHistory.create({
        orderId: order.id,
        riderId: actualRiderId,
        status: 'ASSIGNED',
        updatedBy: req.user?.id || 'admin'
      });
    } catch (histErr) {
      console.error("Assign rider history failed:", histErr);
    }

    // 3. TRIGGER NOTIFICATIONS & EMAILS & SMS
    const riderUser = await User.findByPk(actualRiderId);
    const riderPhone = riderUser ? riderUser.phone : riderApp.phone;
    const riderEmail = riderUser ? riderUser.email : null;

    // RIDER
    const riderSubject = order.orderType === 'EXCHANGE' 
      ? `Two-Way Book Exchange Assigned - Order #${order.id}` 
      : `New Delivery Assigned - Order #${order.id}`;
    const riderMessage = order.orderType === 'EXCHANGE'
      ? `Two-Way Book Exchange order #${order.id} assigned to you. Protocol: First collect book from seller, deliver to buyer and collect exchange book, then deliver exchange book back to seller.`
      : `New delivery assigned to you. Order #${order.id} has been assigned to you by BookCycle Admin.`;

    await notifyUserAndEmail({
      userId: actualRiderId,
      userEmail: riderEmail,
      userPhone: riderPhone,
      subject: riderSubject,
      message: riderMessage,
      type: 'rider_assigned_order',
      orderId: order.id,
      sendSmsFlag: true
    });

    // SELLER
    if (order.sellerId) {
      console.log(`[Assign Rider] Sending email to seller: ${order.seller?.email || 'not found in order'}`);
      const sellerMsg = order.orderType === 'EXCHANGE'
        ? `Rider ${riderApp.fullName} has been assigned for your book exchange Order #${order.id}. The rider will first collect your book for delivery to the buyer, and later deliver the buyer's exchange book back to you.`
        : `Rider ${riderApp.fullName} has been assigned to deliver Order #${order.id}.`;
      await notifyUserAndEmail({
        userId: order.sellerId,
        userEmail: order.seller?.email,
        userPhone: order.seller?.phone,
        subject: `Rider Assigned to Order #${order.id}`,
        message: sellerMsg,
        type: 'order_update',
        orderId: order.id
      });
    }

    // BUYER
    if (order.buyerId) {
      console.log(`[Assign Rider] Sending email to buyer: ${order.buyer?.email || 'not found in order'}`);
      const buyerMsg = order.orderType === 'EXCHANGE'
        ? `Rider ${riderApp.fullName} has been assigned for your book exchange Order #${order.id}. The rider will collect the book from the seller, deliver it to you, and collect your exchange book for the seller.`
        : `Rider ${riderApp.fullName} has been assigned to deliver your Order #${order.id}.`;
      await notifyUserAndEmail({
        userId: order.buyerId,
        userEmail: order.buyer?.email,
        userPhone: order.shippingPhone || order.buyer?.phone,
        subject: `Rider Assigned to Your Order #${order.id}`,
        message: buyerMsg,
        type: 'order_update',
        orderId: order.id,
        sendSmsFlag: true
      });
    }

    // ADMIN
    await notifyAdminUsers({
      subject: `Rider Assigned - Order #${order.id}`,
      message: `Rider ${riderApp.fullName} assigned to Order #${order.id}.`,
      orderId: order.id
    });

    res.status(200).json({
      msg: `Rider ${riderApp.fullName} assigned to order #${order.id} successfully.`,
      order
    });
  } catch (error) {
    console.error('Assign Rider To Order error:', error);
    res.status(500).json({ msg: 'Failed to assign rider to order.' });
  }
};

module.exports = {
  getRiderDashboardStats,
  getAssignedOrders,
  getActiveDelivery,
  updateDeliveryStatus,
  confirmCodCollection,
  getRiderProfile,
  toggleOwnAvailability,
  getAllApprovedRiders,
  toggleRiderActiveStatus,
  assignRiderToOrder
};
