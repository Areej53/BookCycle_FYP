const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const adminAuthMiddleware = require('../middleware/adminAuth');
const {
  submitRiderApplication,
  getRiderRequests,
  getRiderApplicationById,
  approveRiderRequest,
  rejectRiderRequest,
  suspendRider,
  reactivateRider,
  getRiderStatus
} = require('../controllers/riderRequestController');

// Public endpoints
router.post('/register', submitRiderApplication);

// Auth endpoints
router.get('/status', authMiddleware, getRiderStatus);

// Admin endpoints
router.get('/admin/all', adminAuthMiddleware, getRiderRequests);
router.get('/admin/:id', adminAuthMiddleware, getRiderApplicationById);
router.put('/admin/:id/approve', adminAuthMiddleware, approveRiderRequest);
router.put('/admin/:id/reject', adminAuthMiddleware, rejectRiderRequest);
router.put('/admin/:id/suspend', adminAuthMiddleware, suspendRider);
router.put('/admin/:id/reactivate', adminAuthMiddleware, reactivateRider);

module.exports = router;
