const express = require("express");
const router = express.Router();

const {
  getDashboardStats,
  getSellerRequests,
  approveSellerRequest,
  rejectSellerRequest,
  getAllUsers,
  deactivateUser,
  activateUser,
  deleteUser,
  getAllSellers,
  activateSeller,
  deactivateSeller,
  suspendSeller,
  getSellerListings,
  getAllBooks,
  removeBook,
  hideBook,
  restoreBook,
  getAllOrders,
  getExchangeRequests,
  getRecentActivities,
  removeBooksByTitlePattern
} = require("../controllers/adminController");
const adminAuthMiddleware = require("../middleware/adminAuth");

// Dashboard
router.get("/dashboard/stats", adminAuthMiddleware, getDashboardStats);
router.get("/dashboard/activities", adminAuthMiddleware, getRecentActivities);

// Seller Requests
router.get("/seller-requests", adminAuthMiddleware, getSellerRequests);
router.put("/seller-requests/:userId/approve", adminAuthMiddleware, approveSellerRequest);
router.put("/seller-requests/:userId/reject", adminAuthMiddleware, rejectSellerRequest);

// Users
router.get("/users", adminAuthMiddleware, getAllUsers);
router.put("/users/:userId/deactivate", adminAuthMiddleware, deactivateUser);
router.put("/users/:userId/activate", adminAuthMiddleware, activateUser);
router.delete("/users/:userId", adminAuthMiddleware, deleteUser);

// Sellers
router.get("/sellers", adminAuthMiddleware, getAllSellers);
router.get("/sellers/:sellerId/listings", adminAuthMiddleware, getSellerListings);
router.put("/sellers/:userId/activate", adminAuthMiddleware, activateSeller);
router.put("/sellers/:userId/deactivate", adminAuthMiddleware, deactivateSeller);
router.put("/sellers/:userId/suspend", adminAuthMiddleware, suspendSeller);

// Books
router.get("/books", adminAuthMiddleware, getAllBooks);
router.delete("/books/:bookId", adminAuthMiddleware, removeBook);
router.put("/books/:bookId/hide", adminAuthMiddleware, hideBook);
router.put("/books/:bookId/restore", adminAuthMiddleware, restoreBook);
router.delete("/books/pattern/:pattern", adminAuthMiddleware, removeBooksByTitlePattern);

// Orders
router.get("/orders", adminAuthMiddleware, getAllOrders);

// Exchange Requests
router.get("/exchange-requests", adminAuthMiddleware, getExchangeRequests);

module.exports = router;
