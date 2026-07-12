const { Review, Order, User, sequelize } = require("../models");

// Confidence constant: how many "phantom" reviews at the global average
// we assume every seller starts with. Higher C = harder for low-review
// sellers to jump to the top on a couple of lucky 10s.
const BAYESIAN_CONFIDENCE = 5;

// POST /api/v1/reviews
// Buyer leaves a 1-10 rating on a completed order.
const createReview = async (req, res) => {
  const { orderId, rating, comment } = req.body;
  const buyerId = req.user.id;

  if (!orderId || rating == null) {
    return res.status(400).json({ msg: "orderId and rating are required." });
  }

  const numericRating = Number(rating);
  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 10) {
    return res.status(400).json({ msg: "Rating must be a whole number between 1 and 10." });
  }

  const t = await sequelize.transaction();

  try {
    const order = await Order.findByPk(orderId, { transaction: t });

    if (!order) {
      await t.rollback();
      return res.status(404).json({ msg: "Order not found." });
    }
    if (order.buyerId !== buyerId) {
      await t.rollback();
      return res.status(403).json({ msg: "You can only review your own orders." });
    }
    if (order.status !== "completed") {
      await t.rollback();
      return res.status(400).json({ msg: "You can only review completed orders." });
    }

    const review = await Review.create({
      orderId,
      sellerId: order.sellerId,
      buyerId,
      rating: numericRating,
      comment: comment || null
    }, { transaction: t });

    // Update the seller's running total. reviewsCount/ratingsSum live on
    // User so the average is a cheap read; no need to SUM(reviews) every time.
    await User.increment(
      { reviewsCount: 1, ratingsSum: numericRating },
      { where: { id: order.sellerId }, transaction: t }
    );

    await t.commit();
    return res.status(201).json(review);
  } catch (err) {
    await t.rollback();
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ msg: "This order has already been reviewed." });
    }
    console.error("[createReview]", err);
    return res.status(500).json({ msg: "Could not submit review." });
  }
};

// GET /api/v1/reviews/seller/:sellerId
// Paginated list of reviews for one seller's profile page.
const getSellerReviews = async (req, res) => {
  const { sellerId } = req.params;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 10);

  try {
    const seller = await User.findByPk(sellerId, {
      attributes: ["id", "name", "reviewsCount", "ratingsSum"]
    });

    if (!seller) {
      return res.status(404).json({ msg: "Seller not found." });
    }

    const { rows, count } = await Review.findAndCountAll({
      where: { sellerId },
      include: [{ model: User, as: "buyer", attributes: ["id", "name"] }],
      order: [["createdAt", "DESC"]],
      limit,
      offset: (page - 1) * limit
    });

    const averageRating = seller.reviewsCount > 0
      ? Number((seller.ratingsSum / seller.reviewsCount).toFixed(1))
      : null;

    return res.json({
      averageRating,
      reviewsCount: seller.reviewsCount,
      page,
      totalPages: Math.ceil(count / limit),
      reviews: rows
    });
  } catch (err) {
    console.error("[getSellerReviews]", err);
    return res.status(500).json({ msg: "Could not fetch reviews." });
  }
};

// GET /api/v1/reviews/ranking
// Bayesian-ranked seller leaderboard. This is the "scaling" piece -
// sellers with few reviews get pulled toward the global average instead
// of a single 10/10 review letting them outrank an established seller.
const getSellerRanking = async (req, res) => {
  const limit = Math.min(100, Number(req.query.limit) || 20);

  try {
    const sellers = await User.findAll({
      where: { role: "shopkeeper" },
      attributes: ["id", "name", "reviewsCount", "ratingsSum"]
    });

    const rated = sellers.filter(s => s.reviewsCount > 0);

    if (rated.length === 0) {
      return res.json({ globalAverage: null, confidence: BAYESIAN_CONFIDENCE, sellers: [] });
    }

    const totalReviews = rated.reduce((sum, s) => sum + s.reviewsCount, 0);
    const totalRatingSum = rated.reduce((sum, s) => sum + s.ratingsSum, 0);
    const globalAverage = totalRatingSum / totalReviews; // m

    const ranked = rated
      .map(s => {
        const avg = s.ratingsSum / s.reviewsCount; // this seller's own average
        const bayesianRating =
          (BAYESIAN_CONFIDENCE * globalAverage + s.reviewsCount * avg) /
          (BAYESIAN_CONFIDENCE + s.reviewsCount);

        return {
          sellerId: s.id,
          name: s.name,
          reviewsCount: s.reviewsCount,
          averageRating: Number(avg.toFixed(2)),
          bayesianRating: Number(bayesianRating.toFixed(2))
        };
      })
      .sort((a, b) => b.bayesianRating - a.bayesianRating)
      .slice(0, limit);

    return res.json({
      globalAverage: Number(globalAverage.toFixed(2)),
      confidence: BAYESIAN_CONFIDENCE,
      sellers: ranked
    });
  } catch (err) {
    console.error("[getSellerRanking]", err);
    return res.status(500).json({ msg: "Could not build seller ranking." });
  }
};

module.exports = { createReview, getSellerReviews, getSellerRanking };
