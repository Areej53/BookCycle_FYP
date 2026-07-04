const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema(
  {
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
    title: { type: String, trim: true },
    type: { type: String, enum: ["buy", "rent", "free"], default: "buy" },
    price: { type: Number, default: 0 },
    quantity: { type: Number, default: 1 },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    items: { type: [OrderItemSchema], default: [] },
    bookAmount: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    shippingAddress: { type: String },
    shippingPhone: { type: String },
    shippingName: { type: String },
    trackingData: {
      riderName: String,
      riderPhone: String,
      phoneNumber: String,
      bikeNumber: String,
      trackingLink: String,
      pickupLocation: String,
      dropLocation: String,
      vehicleType: String,
      estimatedTime: String,
      trackingNumber: String,
      easypaisaNumber: String,
      notes: String,
    },
    paymentData: {
      receiptUrl: String,
      transactionId: String,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "pending_seller",
        "accepted",
        "rejected",
        "ride_assigned",
        "out_for_delivery",
        "delivered",
        "payment_submitted",
        "completed",
        "cancelled",
        "complain"
      ],
      default: "pending",
    },
    complainReason: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

module.exports = mongoose.model("Order", OrderSchema);
