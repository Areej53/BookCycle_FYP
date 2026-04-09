const Book = require('../models/Book');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const getDashboardStats = async (req, res) => {
  const totalBooks = await Book.countDocuments();
  const totalUsers = await User.countDocuments();
  const totalExchanges = await Transaction.countDocuments({ status: 'Completed' });

  res.status(200).json({ totalBooks, totalUsers, totalExchanges });
};

module.exports = { getDashboardStats };
