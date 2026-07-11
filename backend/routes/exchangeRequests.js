const express = require('express');
const router = express.Router();
const {
  createExchangeRequest,
  getExchangeRequests,
  getExchangeRequestById,
  acceptExchangeRequest,
  rejectExchangeRequest,
  cancelExchangeRequest,
  updateExchangeRequestStatus
} = require('../controllers/exchangeRequestController');
const authenticationMiddleware = require('../middleware/auth');

router.post('/', authenticationMiddleware, createExchangeRequest);
router.get('/', authenticationMiddleware, getExchangeRequests);
router.get('/:id', authenticationMiddleware, getExchangeRequestById);
router.put('/:id/accept', authenticationMiddleware, acceptExchangeRequest);
router.put('/:id/reject', authenticationMiddleware, rejectExchangeRequest);
router.put('/:id/cancel', authenticationMiddleware, cancelExchangeRequest);
router.put('/:id/status', authenticationMiddleware, updateExchangeRequestStatus);

module.exports = router;
