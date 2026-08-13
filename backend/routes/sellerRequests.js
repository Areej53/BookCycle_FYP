const express = require("express");
const router = express.Router();

const {
  requestSellerApproval,
  getSellerRequestStatus
} = require("../controllers/sellerRequestController");
const authMiddleware = require("../middleware/auth");

router.post("/request", authMiddleware, requestSellerApproval);
router.get("/status", authMiddleware, getSellerRequestStatus);

module.exports = router;
