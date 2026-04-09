const express = require('express');
const router = express.Router();
const authenticationMiddleware = require('../middleware/auth');
const { createTransaction, getMyRequests, updateTransactionStatus } = require('../controllers/transactionController');

// All transaction features are strictly protected
router.use(authenticationMiddleware);

router.route('/').post(createTransaction);
router.route('/my-requests').get(getMyRequests);
router.route('/:id').patch(updateTransactionStatus);

module.exports = router;
