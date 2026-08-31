const express = require('express');
const router = express.Router();
const authenticationMiddleware = require('../middleware/auth');
const { scanBookCover } = require('../controllers/aiController');

// AI scanner endpoint - requires authentication
router.post('/scan-book-cover', authenticationMiddleware, scanBookCover);

module.exports = router;
