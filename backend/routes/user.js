const express = require("express");
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

const { sequelize } = require("../db/connectPostgres");

router.get("/health", async (req, res) => {
  let dbOk = false;
  try {
    await sequelize.authenticate();
    dbOk = true;
  } catch (error) {
    dbOk = false;
  }
  res.status(dbOk ? 200 : 503).json({
    ok: true,
    database: dbOk ? "connected" : "disconnected",
    msg: dbOk
      ? "API is running and PostgreSQL is connected."
      : "API process is running but PostgreSQL is not connected.",
  });
});

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);
router.route("/dashboard").get(authMiddleware, dashboard);
router.route("/users").get(getAllUsers);

module.exports = router;
