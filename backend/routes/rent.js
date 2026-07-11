const express = require('express');
const router = express.Router();
const authenticationMiddleware = require('../middleware/auth');
const {
  createRentBook,
  getAllRentBooks,
  getRentBookById,
  updateRentBook,
  deleteRentBook
} = require('../controllers/rentController');

router.route('/')
  .get(getAllRentBooks)
  .post(authenticationMiddleware, createRentBook);

router.route('/:id')
  .get(getRentBookById)
  .put(authenticationMiddleware, updateRentBook)
  .delete(authenticationMiddleware, deleteRentBook);

module.exports = router;
