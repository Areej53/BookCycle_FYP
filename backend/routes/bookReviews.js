const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { createBookReview, getBookReviews, getUserBookReviews } = require('../controllers/bookReviewController');

// POST /api/v1/book-reviews - Create a book review (requires authentication)
router.post('/', authenticateToken, createBookReview);

// GET /api/v1/book-reviews/book/:bookId - Get reviews for a specific book
router.get('/book/:bookId', getBookReviews);

// GET /api/v1/book-reviews/user/:userId - Get reviews by a specific user
router.get('/user/:userId', getUserBookReviews);

module.exports = router;