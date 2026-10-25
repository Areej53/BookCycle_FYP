const { BookReview, Book, User, sequelize } = require("../models");
const { Op } = require("sequelize");

// POST /api/v1/book-reviews
// User leaves a 1-5 star rating on a book.
// IMPORTANT: ratings are for the SELLER, not the specific book.
// Each review increments both the book counters AND the seller (User) counters
// so the seller's combined score appears on ALL their listings.
const createBookReview = async (req, res) => {
  const { bookId, rating, comment } = req.body;
  const userId = req.user.id;

  if (!bookId || rating == null) {
    return res.status(400).json({ msg: "bookId and rating are required." });
  }

  const numericRating = Number(rating);
  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({ msg: "Rating must be a whole number between 1 and 5." });
  }

  const t = await sequelize.transaction();

  try {
    const book = await Book.findByPk(bookId, { transaction: t });
    if (!book) {
      await t.rollback();
      return res.status(404).json({ msg: "Book not found." });
    }

    if (book.ownerId === userId) {
      await t.rollback();
      return res.status(403).json({ msg: "You cannot review your own book." });
    }

    const existingReview = await BookReview.findOne({
      where: { bookId, userId },
      transaction: t
    });

    if (existingReview) {
      await t.rollback();
      return res.status(400).json({ msg: "You have already reviewed this book." });
    }

    const review = await BookReview.create({
      bookId,
      userId,
      rating: numericRating,
      comment: comment || null
    }, { transaction: t });

    // Keep book-level counters for per-book history records
    await Book.increment(
      { reviewsCount: 1, ratingsSum: numericRating },
      { where: { id: bookId }, transaction: t }
    );

    // ─── SELLER-LEVEL AGGREGATION ────────────────────────────────────────────
    // Also update the SELLER's (User) combined rating counters.
    // Ratings belong to the SELLER, not a specific book.
    // IMPORTANT: User.ratingsSum uses 1-10 scale (from order reviews).
    // Book reviews are 1-5, so multiply by 2 to normalise to 1-10 scale.
    // The seller score displayed on cards and dashboard will then divide back
    // to 1-5 stars for display consistently.
    // ─────────────────────────────────────────────────────────────────────────
    await User.increment(
      { reviewsCount: 1, ratingsSum: numericRating * 2 },
      { where: { id: book.ownerId }, transaction: t }
    );

    await t.commit();
    return res.status(201).json(review);
  } catch (err) {
    await t.rollback();
    console.error("[createBookReview]", err);
    return res.status(500).json({ msg: "Could not submit review." });
  }
};

// GET /api/v1/book-reviews/book/:bookId
// Returns ALL reviews for the SELLER who owns this book — aggregated across ALL their listings.
// This means every book detail page for the same seller shows identical seller rating history.
const getBookReviews = async (req, res) => {
  const { bookId } = req.params;
  const page  = Math.max(1, Number(req.query.page)  || 1);
  const limit = Math.min(50, Number(req.query.limit) || 10);

  try {
    const book = await Book.findByPk(bookId, {
      attributes: ["id", "title", "ownerId"]
    });
    if (!book) {
      return res.status(404).json({ msg: "Book not found." });
    }

    const sellerId = book.ownerId;

    // Get seller's aggregated counters (source of truth for combined rating)
    const seller = await User.findByPk(sellerId, {
      attributes: ["id", "name", "reviewsCount", "ratingsSum"]
    });

    // All book IDs owned by this seller
    const sellerBooks = await Book.findAll({
      where: { ownerId: sellerId },
      attributes: ["id"]
    });
    const sellerBookIds = sellerBooks.map(b => b.id);

    // Paginated reviews across ALL of the seller's books
    const { rows, count } = await BookReview.findAndCountAll({
      where: { bookId: { [Op.in]: sellerBookIds } },
      include: [
        { model: User, as: "user", attributes: ["id", "name"] },
        { model: Book, as: "book", attributes: ["id", "title"] }
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset: (page - 1) * limit
    });

    // Compute rating stats from ACTUAL rows — never rely on User counter columns
    // which may be stale for pre-existing data. This works for ALL sellers always.
    const allRatings = await BookReview.findAll({
      where: { bookId: { [Op.in]: sellerBookIds } },
      attributes: ["rating"]
    });
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let ratingSum = 0;
    allRatings.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) {
        ratingDistribution[r.rating]++;
        ratingSum += r.rating;
      }
    });
    const totalCount   = allRatings.length;
    const averageRating = totalCount > 0
      ? Number((ratingSum / totalCount).toFixed(1))
      : null;

    return res.json({
      sellerId,
      sellerName: seller ? seller.name : "Seller",
      bookId: book.id,
      bookTitle: book.title,
      averageRating,
      reviewsCount: totalCount,
      ratingDistribution,
      page,
      totalPages: Math.ceil(count / limit),
      reviews: rows
    });
  } catch (err) {
    console.error("[getBookReviews]", err);
    return res.status(500).json({ msg: "Could not fetch reviews." });
  }
};

// GET /api/v1/book-reviews/user/:userId
const getUserBookReviews = async (req, res) => {
  const { userId } = req.params;
  const page  = Math.max(1, Number(req.query.page)  || 1);
  const limit = Math.min(50, Number(req.query.limit) || 10);

  try {
    const { rows, count } = await BookReview.findAndCountAll({
      where: { userId },
      include: [
        { model: Book, as: "book", attributes: ["id", "title", "author", "image"] },
        { model: User, as: "user", attributes: ["id", "name"] }
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset: (page - 1) * limit
    });
    return res.json({ userId, page, totalPages: Math.ceil(count / limit), reviews: rows });
  } catch (err) {
    console.error("[getUserBookReviews]", err);
    return res.status(500).json({ msg: "Could not fetch user reviews." });
  }
};

// GET /api/v1/book-reviews/seller/:sellerId
// Returns aggregated book review data for a specific seller.
// Used by SellerRatingCard on the dashboard and book detail pages.
const getSellerBookReviews = async (req, res) => {
  const { sellerId } = req.params;
  const page  = Math.max(1, Number(req.query.page)  || 1);
  const limit = Math.min(50, Number(req.query.limit) || 10);

  try {
    const seller = await User.findByPk(sellerId, {
      attributes: ["id", "name", "reviewsCount", "ratingsSum"]
    });
    if (!seller) {
      return res.status(404).json({ msg: "Seller not found." });
    }

    const sellerBooks = await Book.findAll({
      where: { ownerId: sellerId },
      attributes: ["id"]
    });
    const sellerBookIds = sellerBooks.map(b => b.id);

    if (sellerBookIds.length === 0) {
      return res.json({
        sellerId, sellerName: seller.name,
        averageRating: null, reviewsCount: 0,
        ratingDistribution: { 5:0, 4:0, 3:0, 2:0, 1:0 },
        page: 1, totalPages: 0, reviews: []
      });
    }

    const { rows, count } = await BookReview.findAndCountAll({
      where: { bookId: { [Op.in]: sellerBookIds } },
      include: [
        { model: User, as: "user", attributes: ["id", "name"] },
        { model: Book, as: "book", attributes: ["id", "title"] }
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset: (page - 1) * limit
    });

    // Compute stats from ACTUAL rows — never rely on User counter columns
    const allRatings = await BookReview.findAll({
      where: { bookId: { [Op.in]: sellerBookIds } },
      attributes: ["rating"]
    });
    const ratingDistribution = { 5:0, 4:0, 3:0, 2:0, 1:0 };
    let ratingSum = 0;
    allRatings.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) {
        ratingDistribution[r.rating]++;
        ratingSum += r.rating;
      }
    });
    const totalCount    = allRatings.length;
    const averageRating = totalCount > 0
      ? Number((ratingSum / totalCount).toFixed(1))
      : null;

    return res.json({
      sellerId, sellerName: seller.name,
      averageRating, reviewsCount: totalCount,
      ratingDistribution, page,
      totalPages: Math.ceil(count / limit),
      reviews: rows
    });
  } catch (err) {
    console.error("[getSellerBookReviews]", err);
    return res.status(500).json({ msg: "Could not fetch seller reviews." });
  }
};

module.exports = { createBookReview, getBookReviews, getUserBookReviews, getSellerBookReviews };