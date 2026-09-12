const { BookReview, Book, User, sequelize } = require("../models");

// POST /api/v1/book-reviews
// User leaves a 1-5 star rating on a book
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
    // Check if book exists
    const book = await Book.findByPk(bookId, { transaction: t });
    if (!book) {
      await t.rollback();
      return res.status(404).json({ msg: "Book not found." });
    }

    // Check if user is the seller/owner of the book
    if (book.ownerId === userId) {
      await t.rollback();
      return res.status(403).json({ msg: "You cannot review your own book." });
    }

    // Check if user already reviewed this book
    const existingReview = await BookReview.findOne({
      where: { bookId, userId },
      transaction: t
    });

    if (existingReview) {
      await t.rollback();
      return res.status(400).json({ msg: "You have already reviewed this book." });
    }

    // Create the review
    const review = await BookReview.create({
      bookId,
      userId,
      rating: numericRating,
      comment: comment || null
    }, { transaction: t });

    // Update the book's rating totals
    await Book.increment(
      { reviewsCount: 1, ratingsSum: numericRating },
      { where: { id: bookId }, transaction: t }
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
// Get all reviews for a specific book
const getBookReviews = async (req, res) => {
  const { bookId } = req.params;
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Number(req.query.limit) || 10);

  try {
    const book = await Book.findByPk(bookId, {
      attributes: ["id", "title", "reviewsCount", "ratingsSum"]
    });

    if (!book) {
      return res.status(404).json({ msg: "Book not found." });
    }

    const { rows, count } = await BookReview.findAndCountAll({
      where: { bookId },
      include: [{ model: User, as: "user", attributes: ["id", "name"] }],
      order: [["createdAt", "DESC"]],
      limit,
      offset: (page - 1) * limit
    });

    const averageRating = book.reviewsCount > 0
      ? Number((book.ratingsSum / book.reviewsCount).toFixed(1))
      : null;

    // Calculate rating distribution
    const allReviews = await BookReview.findAll({
      where: { bookId },
      attributes: ['rating']
    });

    const ratingDistribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    };

    allReviews.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        ratingDistribution[review.rating]++;
      }
    });

    return res.json({
      bookId: book.id,
      bookTitle: book.title,
      averageRating,
      reviewsCount: book.reviewsCount,
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
// Get all reviews by a specific user
const getUserBookReviews = async (req, res) => {
  const { userId } = req.params;
  const page = Math.max(1, Number(req.query.page) || 1);
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

    return res.json({
      userId,
      page,
      totalPages: Math.ceil(count / limit),
      reviews: rows
    });
  } catch (err) {
    console.error("[getUserBookReviews]", err);
    return res.status(500).json({ msg: "Could not fetch user reviews." });
  }
};

module.exports = { createBookReview, getBookReviews, getUserBookReviews };