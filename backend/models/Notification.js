const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["order", "rent", "system", "general", "order_update"],
      default: "general",
    },
    actionLink: { type: String },
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

module.exports = mongoose.model("Notification", NotificationSchema);
