const express = require("express");
const authMiddleware = require("../middleware/auth");
const { createOrder, getOrders, updateOrderStatus } = require("../controllers/orderController");

const router = express.Router();

router.route("/").get(authMiddleware, getOrders).post(authMiddleware, createOrder);
router.route("/:orderId").put(authMiddleware, updateOrderStatus);

module.exports = router;
