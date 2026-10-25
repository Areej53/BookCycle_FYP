const { User, Notification } = require("../models");

const requestSellerApproval = async (req, res) => {
  try {
    // Check if user is admin - admins cannot submit seller requests
    if (req.user.role === 'admin') {
      return res.status(403).json({ msg: 'Admin users cannot submit seller requests.' });
    }

    const userId = req.user.id;
    const { city, address, phone } = req.body;

    // Islamabad-only validation
    if (city && !city.toLowerCase().includes('islamabad')) {
      return res.status(400).json({ msg: 'Sorry, we currently only serve sellers in Islamabad.' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (user.sellerStatus === 'pending') {
      return res.status(400).json({ msg: 'Your seller request is already pending approval.' });
    }

    if (user.sellerStatus === 'approved') {
      return res.status(400).json({ msg: 'Your seller account is already approved.' });
    }

    // Update seller information
    user.sellerStatus = 'pending';
    user.sellerRequestDate = new Date();
    if (city) user.city = city;
    if (address) user.address = address;
    if (address) user.pickupAddress = address; // Keep pickupAddress for backward compatibility
    if (phone) user.phone = phone;
    await user.save();

    // Create notification for user
    try {
      await Notification.create({
        userId: user.id,
        type: 'seller_request_submitted',
        message: 'Your seller approval request has been submitted. You will be notified once it is reviewed.',
        isRead: false
      });
    } catch (notificationErr) {
      console.error('Failed to create seller request notification:', notificationErr);
    }

    res.status(200).json({
      msg: 'Seller approval request submitted successfully',
      sellerStatus: 'pending'
    });
  } catch (error) {
    console.error('Request seller approval error:', error);
    res.status(500).json({ msg: error.message || 'Failed to submit seller approval request' });
  }
};

const getSellerRequestStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.status(200).json({ 
      sellerStatus: user.sellerStatus,
      sellerRequestDate: user.sellerRequestDate
    });
  } catch (error) {
    console.error('Get seller request status error:', error);
    res.status(500).json({ msg: 'Failed to fetch seller request status' });
  }
};

module.exports = {
  requestSellerApproval,
  getSellerRequestStatus
};
