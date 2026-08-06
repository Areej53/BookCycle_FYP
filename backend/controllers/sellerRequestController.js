const { User, Notification } = require("../models");

const requestSellerApproval = async (req, res) => {
  try {
    const userId = req.user.id;
    
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

    user.sellerStatus = 'pending';
    user.sellerRequestDate = new Date();
    await user.save();

    // Create notification for user
    await Notification.create({
      userId: user.id,
      type: 'seller_request_submitted',
      message: 'Your seller approval request has been submitted. You will be notified once it is reviewed.',
      isRead: false
    });

    res.status(200).json({ 
      msg: 'Seller approval request submitted successfully',
      sellerStatus: 'pending'
    });
  } catch (error) {
    console.error('Request seller approval error:', error);
    res.status(500).json({ msg: 'Failed to submit seller approval request' });
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
