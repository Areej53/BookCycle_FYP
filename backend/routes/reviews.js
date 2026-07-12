const express = require("express");
const authMiddleware = require("../middleware/auth");
const { createReview, getSellerReviews, getSellerRanking } = require("../controllers/reviewController");

const router = express.Router();

router.route("/").post(authMiddleware, createReview);
router.route("/ranking").get(getSellerRanking);
router.route("/seller/:sellerId").get(getSellerReviews);

module.exports = router;
