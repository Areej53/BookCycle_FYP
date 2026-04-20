const mongoose = require("mongoose");
const Order = require("../models/Order");
const Notification = require("../models/Notification");
const User = require("../models/User");

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
    status: payload.status || "pending",
  };
};

const createOrder = async (req, res) => {
  const payload = normalizeOrderPayload(req.body);
  payload.buyerId = payload.buyerId || req.user.id;

  if (!payload.sellerId || !payload.items.length) {
    return res.status(400).json({ msg: "sellerId and items are required." });
  }

  payload.trackingData = {
    ...payload.trackingData,
    trackingNumber: `BC-${Date.now().toString().slice(-6)}`
  };

  const order = await Order.create(payload);

  await Notification.create({
    userId: payload.sellerId,
    message: "New order received",
    type: "order",
    isRead: false,
  });

  await Notification.create({
    userId: payload.buyerId,
    message: "Order placed successfully",
    type: "order",
    isRead: false,
  });

  return res.status(201).json({ order });
};

const getOrders = async (req, res) => {
  const { sellerId, buyerId } = req.query;
  const query = {};

  if (sellerId && mongoose.isValidObjectId(sellerId)) query.sellerId = sellerId;
  if (buyerId && mongoose.isValidObjectId(buyerId)) query.buyerId = buyerId;

  const orders = await Order.find(query)
    .sort("-createdAt")
    .populate("buyerId", "name email")
    .populate("sellerId", "name email");

  return res.status(200).json({ orders, count: orders.length });
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, trackingData, paymentData } = req.body;
    
    const order = await Order.findById(orderId).populate("buyerId").populate("sellerId");
    if (!order) return res.status(404).json({ msg: "Order not found" });

    // Status transitions
    if (status) order.status = status;
    if (trackingData) {
      const existingTracking = order.trackingData ? (order.trackingData.toObject ? order.trackingData.toObject() : order.trackingData) : {};
      order.trackingData = { ...existingTracking, ...trackingData };
    }
    if (paymentData) {
      order.paymentData = { ...(order.paymentData || {}), ...paymentData };
    }
    
    await order.save();

    // Notification Logic
    if (status === "accepted") {
      const Book = require("../models/Book");
      for (const item of order.items) {
        if (item.bookId) {
          await Book.findByIdAndUpdate(item.bookId, { status: "Unavailable" });
        }
      }
      await Notification.create({ userId: order.buyerId._id, message: "Your order has been accepted", type: "order_update", orderId: order._id });
    } else if (status === "rejected") {
      await Notification.create({ userId: order.buyerId._id, message: "Your order has been rejected", type: "order_update", orderId: order._id });
    } else if (status === "out_for_delivery") {
      const trackNo = order.trackingData?.trackingNumber || 'N/A';
      await Notification.create({ userId: order.buyerId._id, message: `Your order is out for delivery. Tracking number: ${trackNo}`, type: "order_update", orderId: order._id });
    } else if (status === "payment_submitted") {
      await Notification.create({ userId: order.buyerId._id, message: "Your payment has been submitted", type: "order_update", orderId: order._id });
      await Notification.create({ userId: order.sellerId._id, message: `${order.buyerId?.name || "Buyer"} has submitted the payment`, type: "order_update", orderId: order._id });
    } else if (status === "completed") {
      await Notification.create({ userId: order.buyerId._id, message: "Your order is completed", type: "order_update", orderId: order._id });
      await Notification.create({ userId: order.sellerId._id, message: "Order completed. Earnings added.", type: "order_update", orderId: order._id });
      
      const earning = order.bookAmount != null ? order.bookAmount : order.totalAmount;
      await User.findByIdAndUpdate(order.sellerId._id, {
        $inc: { 
          'finance.totalEarnings': earning, 
          'finance.monthlyEarnings': earning, 
          'finance.completedOrdersRevenue': earning 
        }
      });
    }

    res.status(200).json({ order });
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error });
  }
};

module.exports = {
  createOrder,
  getOrders,
  updateOrderStatus
};
