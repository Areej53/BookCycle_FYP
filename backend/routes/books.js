const express = require('express');
const router = express.Router();
const authenticationMiddleware = require('../middleware/auth');
const { getAllBooks, getBook, createBook, updateBook, deleteBook, getRecommendedBooks } = require('../controllers/bookController');

router.route('/').get(getAllBooks).post(authenticationMiddleware, createBook);
router.route('/recommended').get(authenticationMiddleware, getRecommendedBooks);
router.route('/:id').get(getBook).patch(authenticationMiddleware, updateBook).delete(authenticationMiddleware, deleteBook);

module.exports = router;
