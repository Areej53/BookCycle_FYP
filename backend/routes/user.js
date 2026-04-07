const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const {
  login,
  register,
  dashboard,
  getAllUsers,
  forgotPassword,
  resetPassword,
} = require("../controllers/user");
const authMiddleware = require("../middleware/auth");

router.get("/health", (req, res) => {
  const dbOk = mongoose.connection.readyState === 1;
  res.status(dbOk ? 200 : 503).json({
    ok: true,
    database: dbOk ? "connected" : "disconnected",
    msg: dbOk
      ? "API is running and MongoDB is connected."
      : "API process is running but MongoDB is not connected.",
  });
});

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);
router.route("/dashboard").get(authMiddleware, dashboard);
router.route("/users").get(getAllUsers);

module.exports = router;
