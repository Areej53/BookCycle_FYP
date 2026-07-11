const express = require('express');
const router = express.Router();
const {
  createExchangeBook,
  getAllExchangeBooks,
  getExchangeBookById,
  updateExchangeBook,
  deleteExchangeBook
} = require('../controllers/exchangeController');
const authenticationMiddleware = require('../middleware/auth');

router.post('/', authenticationMiddleware, createExchangeBook);
router.get('/', authenticationMiddleware, getAllExchangeBooks);
router.get('/:id', authenticationMiddleware, getExchangeBookById);
router.put('/:id', authenticationMiddleware, updateExchangeBook);
router.delete('/:id', authenticationMiddleware, deleteExchangeBook);

module.exports = router;
