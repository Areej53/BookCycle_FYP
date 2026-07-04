const { Book, User, Transaction } = require('../models');

const getDashboardStats = async (req, res) => {
  const totalBooks = await Book.count();
  const totalUsers = await User.count();
  const totalExchanges = await Transaction.count({ where: { status: 'Completed' } });

  res.status(200).json({ totalBooks, totalUsers, totalExchanges });
};

module.exports = { getDashboardStats };
