const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const adminAuthMiddleware = require('../middleware/adminAuth');
const {
  getRiderDashboardStats,
  getAssignedOrders,
  getActiveDelivery,
  updateDeliveryStatus,
  confirmCodCollection,
  getRiderProfile,
  toggleOwnAvailability,
  getAllApprovedRiders,
  toggleRiderActiveStatus,
  assignRiderToOrder
} = require('../controllers/riderController');

// Rider endpoints (requires logged in Rider user)
router.get('/dashboard-stats', authMiddleware, getRiderDashboardStats);
router.get('/assigned-orders', authMiddleware, getAssignedOrders);
router.get('/active-delivery', authMiddleware, getActiveDelivery);
router.put('/delivery-status/:orderId', authMiddleware, updateDeliveryStatus);
router.put('/confirm-cod-collection/:orderId', authMiddleware, confirmCodCollection);
router.get('/profile', authMiddleware, getRiderProfile);
router.put('/toggle-availability', authMiddleware, toggleOwnAvailability);

// Admin rider management & assignment endpoints
router.get('/admin/approved', adminAuthMiddleware, getAllApprovedRiders);
router.put('/admin/:riderUserId/toggle-active', adminAuthMiddleware, toggleRiderActiveStatus);
router.put('/admin/assign-order/:orderId', adminAuthMiddleware, assignRiderToOrder);

module.exports = router;
