const Notification = require("../models/Notification");

const getNotifications = async (req, res) => {
  const userId = req.user.id;
  const notifications = await Notification.find({ userId }).sort("-createdAt");
  return res
    .status(200)
    .json({ notifications, count: notifications.length });
};

const createNotification = async (req, res) => {
  const { userId, message, type } = req.body;
  if (!userId || !message) {
    return res.status(400).json({ msg: "userId and message are required." });
  }

  const notification = await Notification.create({
    userId,
    message,
    type: type || "general",
    isRead: false,
  });

  return res.status(201).json({ notification });
};

const markNotificationAsRead = async (req, res) => {
  const { id } = req.params;
  const notification = await Notification.findOneAndUpdate(
    { _id: id, userId: req.user.id },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({ msg: "Notification not found." });
  }

  return res.status(200).json({ notification });
};

module.exports = {
  getNotifications,
  createNotification,
  markNotificationAsRead,
};
