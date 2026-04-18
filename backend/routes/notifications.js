const express = require("express");
const authMiddleware = require("../middleware/auth");
const {
  getNotifications,
  createNotification,
  markNotificationAsRead,
} = require("../controllers/notificationController");

const router = express.Router();

router.route("/").get(authMiddleware, getNotifications).post(authMiddleware, createNotification);
router.patch("/:id/read", authMiddleware, markNotificationAsRead);

module.exports = router;
