const { User, Book, Order, Exchange, ExchangeRequest, Notification } = require("../models");
const { sequelize } = require("../db/connectPostgres");
const { Op } = require("sequelize");

// Dashboard Statistics
const getDashboardStats = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const [
      totalUsers,
      totalSellers,
      activeSellers,
      inactiveSellers,
      totalBooks,
      booksToday,
      booksThisWeek,
      sellListings,
      rentListings,
      exchangeListings,
      activeOrders,
      pendingDeliveries,
      completedDeliveries,
      pendingSellerRequests,
      totalPayments,
      pendingPaymentVerifications,
      rawCategoryCounts
    ] = await Promise.all([
      User.count({ where: { role: 'customer' } }),
      User.count({ where: { [Op.or]: [{ role: 'shopkeeper' }, { sellerStatus: 'approved' }] } }),
      User.count({ where: { sellerStatus: 'approved' } }),
      User.count({ where: { sellerStatus: { [Op.or]: ['pending', 'rejected', 'inactive', 'suspended'] } } }),
      Book.count(),
      Book.count({ where: { createdAt: { [Op.gte]: todayStart } } }),
      Book.count({ where: { createdAt: { [Op.gte]: weekAgo } } }),
      Book.count({ where: { exchangeType: 'Sell' } }),
      Book.count({ where: { exchangeType: 'Rent' } }),
      Book.count({ where: { exchangeType: 'Exchange' } }),
      Order.count({ where: { status: { [Op.in]: ['pending', 'pending_seller', 'accepted', 'out_for_delivery', 'payment_submitted'] } } }),
      Order.count({ where: { status: { [Op.in]: ['out_for_delivery', 'pending', 'pending_seller', 'accepted', 'payment_submitted'] } } }),
      Order.count({ where: { status: { [Op.in]: ['delivered', 'completed'] } } }),
      User.count({ where: { sellerStatus: 'pending' } }),
      Order.sum('totalAmount', { where: { status: { [Op.in]: ['delivered', 'completed'] } } }),
      Order.count({ where: { status: 'payment_submitted' } }),
      Book.findAll({
        attributes: ['category', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['category'],
        raw: true
      })
    ]).catch(err => {
      console.error('Stats query error:', err);
      return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, []];
    });

    const categoryCounts = {};
    if (Array.isArray(rawCategoryCounts)) {
      rawCategoryCounts.forEach(item => {
        if (item.category) {
          categoryCounts[item.category] = parseInt(item.count, 10) || 0;
        }
      });
    }

    res.status(200).json({
      totalUsers,
      totalSellers,
      activeSellers,
      inactiveSellers,
      totalBooks,
      booksToday,
      booksThisWeek,
      sellListings,
      rentListings,
      exchangeListings,
      activeOrders,
      pendingDeliveries,
      completedDeliveries,
      pendingSellerRequests,
      totalPayments: totalPayments || 0,
      pendingPaymentVerifications,
      categoryCounts
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ msg: 'Failed to fetch dashboard statistics' });
  }
};

// Seller Requests
const getSellerRequests = async (req, res) => {
  try {
    const sellers = await User.findAll({
      where: { sellerStatus: 'pending' },
      order: [['sellerRequestDate', 'DESC']]
    });

    res.status(200).json({ sellers });
  } catch (error) {
    console.error('Get seller requests error:', error);
    res.status(500).json({ msg: 'Failed to fetch seller requests' });
  }
};

const approveSellerRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Approving seller with userId:', userId);
    
    const seller = await User.findByPk(userId);
    if (!seller) {
      console.log('Seller not found with userId:', userId);
      return res.status(404).json({ msg: 'Seller not found' });
    }

    console.log('Found seller:', seller.name, 'current status:', seller.sellerStatus, 'current role:', seller.role);

    seller.sellerStatus = 'approved';
    seller.role = 'shopkeeper';
    await seller.save();

    console.log('Seller updated successfully');

    // Create notification
    try {
      await Notification.create({
        userId: seller.id,
        type: 'seller_approved',
        message: 'Your seller account has been approved. You can now start listing books.',
        isRead: false
      });
      console.log('Notification created successfully');
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError);
      // Continue even if notification fails
    }

    res.status(200).json({ msg: 'Seller approved successfully' });
  } catch (error) {
    console.error('Approve seller error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ msg: 'Failed to approve seller' });
  }
};

const rejectSellerRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const seller = await User.findByPk(userId);
    if (!seller) {
      return res.status(404).json({ msg: 'Seller not found' });
    }

    seller.sellerStatus = 'rejected';
    await seller.save();

    // Create notification
    try {
      await Notification.create({
        userId: seller.id,
        type: 'seller_rejected',
        message: 'Your seller account request has been rejected. Please contact support for more information.',
        isRead: false
      });
    } catch (notificationErr) {
      console.error('Failed to create seller rejected notification:', notificationErr);
    }

    res.status(200).json({ msg: 'Seller rejected successfully' });
  } catch (error) {
    console.error('Reject seller error:', error);
    res.status(500).json({ msg: 'Failed to reject seller' });
  }
};

// Users Management
const getAllUsers = async (req, res) => {
  try {
    console.log('Fetching all users...');
    const users = await User.findAll({
      where: { role: 'customer' },
      order: [['createdAt', 'DESC']]
    });
    console.log(`Found ${users.length} users with role: customer`);
    
    // Also check total users count for debugging
    const totalUsers = await User.count();
    console.log(`Total users in database: ${totalUsers}`);

    res.status(200).json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ msg: 'Failed to fetch users' });
  }
};

const deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.isBlocked = true;
    await user.save();

    res.status(200).json({ msg: 'User deactivated successfully' });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ msg: 'Failed to deactivate user' });
  }
};

const activateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.isBlocked = false;
    await user.save();

    res.status(200).json({ msg: 'User activated successfully' });
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({ msg: 'Failed to activate user' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    await user.destroy();

    res.status(200).json({ msg: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ msg: 'Failed to delete user' });
  }
};

// Sellers Management
const getAllSellers = async (req, res) => {
  try {
    console.log('Fetching all sellers...');
    
    // Get all users who:
    // 1) are shopkeepers OR have sellerStatus set (not null/empty)
    // 2) OR have listed books in the platform
    const [shopkeepersAndSellers, usersWithBooks] = await Promise.all([
      User.findAll({
        where: {
          role: { [Op.ne]: 'admin' },
          [Op.or]: [
            { role: 'shopkeeper' },
            { sellerStatus: { [Op.ne]: null } }
          ]
        },
        order: [['createdAt', 'DESC']]
      }),
      Book.findAll({
        attributes: ['ownerId'],
        group: ['ownerId']
      })
    ]);

    const bookOwnerIds = [...new Set(usersWithBooks.map(b => b.ownerId).filter(Boolean))];
    const bookOwners = bookOwnerIds.length > 0 ? await User.findAll({
      where: { 
        id: { [Op.in]: bookOwnerIds },
        role: { [Op.ne]: 'admin' }
      }
    }) : [];

    // Combine and deduplicate sellers
    const allSellersMap = new Map();
    [...shopkeepersAndSellers, ...bookOwners].forEach(seller => {
      if (seller && seller.id) {
        allSellersMap.set(seller.id, seller);
      }
    });
    const sellers = Array.from(allSellersMap.values());

    console.log(`Total unique sellers: ${sellers.length} (shopkeepers/sellers: ${shopkeepersAndSellers.length}, book owners: ${bookOwners.length})`);

    const sellersWithStats = await Promise.all(sellers.map(async (seller) => {
      const sellerData = seller.toJSON ? seller.toJSON() : seller;

      const [bookCount, sellCount, rentCount, exchangeCount, orderCount, books] = await Promise.all([
        Book.count({ where: { ownerId: seller.id } }),
        Book.count({ 
          where: { 
            ownerId: seller.id, 
            exchangeType: { [Op.or]: ['Sell', 'sell', 'SELL'] } 
          } 
        }),
        Book.count({ 
          where: { 
            ownerId: seller.id, 
            exchangeType: { [Op.or]: ['Rent', 'rent', 'RENT'] } 
          } 
        }),
        Book.count({ 
          where: { 
            ownerId: seller.id, 
            exchangeType: { [Op.or]: ['Exchange', 'exchange', 'EXCHANGE'] } 
          } 
        }),
        Order.count({ where: { sellerId: seller.id } }).catch(() => 0),
        Book.findAll({
          where: { ownerId: seller.id },
          order: [['createdAt', 'DESC']]
        }).catch(() => [])
      ]);

      // Group books by exchange type
      const sellBooks = books.filter(b => String(b.exchangeType || '').toLowerCase() === 'sell');
      const rentBooks = books.filter(b => String(b.exchangeType || '').toLowerCase() === 'rent');
      const exchangeBooks = books.filter(b => String(b.exchangeType || '').toLowerCase() === 'exchange');

      // Normalize seller status fallback
      let status = sellerData.sellerStatus;
      if (!status) {
        if (sellerData.role === 'shopkeeper' || bookCount > 0) {
          status = 'approved';
        } else {
          status = 'inactive';
        }
      }

      return {
        ...sellerData,
        name: sellerData.name || sellerData.email?.split('@')[0] || 'Seller',
        sellerStatus: status,
        bookCount,
        sellCount,
        rentCount,
        exchangeCount,
        orderCount,
        books: {
          sell: sellBooks,
          rent: rentBooks,
          exchange: exchangeBooks
        }
      };
    }));

    res.status(200).json({ sellers: sellersWithStats });
  } catch (error) {
    console.error('Get sellers error:', error);
    res.status(500).json({ msg: 'Failed to fetch sellers' });
  }
};

const activateSeller = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const seller = await User.findByPk(userId);
    if (!seller) {
      return res.status(404).json({ msg: 'Seller not found' });
    }

    seller.sellerStatus = 'approved';
    seller.isBlocked = false;
    await seller.save();

    // Create notification
    try {
      await Notification.create({
        userId: seller.id,
        type: 'account_activated',
        message: 'Your account has been activated. You can now use all features.',
        isRead: false
      });
    } catch (notificationErr) {
      console.error('Failed to create account activated notification:', notificationErr);
    }

    res.status(200).json({ msg: 'Seller activated successfully' });
  } catch (error) {
    console.error('Activate seller error:', error);
    res.status(500).json({ msg: 'Failed to activate seller' });
  }
};

const deactivateSeller = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const seller = await User.findByPk(userId);
    if (!seller) {
      return res.status(404).json({ msg: 'Seller not found' });
    }

    seller.sellerStatus = 'inactive';
    await seller.save();

    res.status(200).json({ msg: 'Seller deactivated successfully' });
  } catch (error) {
    console.error('Deactivate seller error:', error);
    res.status(500).json({ msg: 'Failed to deactivate seller' });
  }
};

const suspendSeller = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const seller = await User.findByPk(userId);
    if (!seller) {
      return res.status(404).json({ msg: 'Seller not found' });
    }

    seller.sellerStatus = 'suspended';
    seller.isBlocked = true;
    await seller.save();

    // Create notification
    try {
      await Notification.create({
        userId: seller.id,
        type: 'account_suspended',
        message: 'Your account has been suspended. Please contact support for more information.',
        isRead: false
      });
    } catch (notificationErr) {
      console.error('Failed to create account suspended notification:', notificationErr);
    }

    res.status(200).json({ msg: 'Seller suspended successfully' });
  } catch (error) {
    console.error('Suspend seller error:', error);
    res.status(500).json({ msg: 'Failed to suspend seller' });
  }
};

// Books Management
const getAllBooks = async (req, res) => {
  try {
    console.log('Fetching all books...');
    const books = await Book.findAll({
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    console.log(`Found ${books.length} books`);
    
    // Count books by type
    const sellCount = await Book.count({ where: { exchangeType: 'Sell' } });
    const rentCount = await Book.count({ where: { exchangeType: 'Rent' } });
    const exchangeCount = await Book.count({ where: { exchangeType: 'Exchange' } });
    console.log(`Book counts - Sell: ${sellCount}, Rent: ${rentCount}, Exchange: ${exchangeCount}`);

    res.status(200).json({ books });
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ msg: 'Failed to fetch books' });
  }
};

const removeBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    
    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    await book.destroy();

    res.status(200).json({ msg: 'Book removed successfully' });
  } catch (error) {
    console.error('Remove book error:', error);
    res.status(500).json({ msg: 'Failed to remove book' });
  }
};

const hideBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    
    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    book.status = 'hidden';
    await book.save();

    res.status(200).json({ msg: 'Book hidden successfully' });
  } catch (error) {
    console.error('Hide book error:', error);
    res.status(500).json({ msg: 'Failed to hide book' });
  }
};

const restoreBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    
    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({ msg: 'Book not found' });
    }

    book.status = 'Available';
    await book.save();

    res.status(200).json({ msg: 'Book restored successfully' });
  } catch (error) {
    console.error('Restore book error:', error);
    res.status(500).json({ msg: 'Failed to restore book' });
  }
};

// Orders Management
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ msg: 'Failed to fetch orders' });
  }
};

// Exchange Requests Management
const getExchangeRequests = async (req, res) => {
  try {
    const exchangeRequests = await ExchangeRequest.findAll({
      include: [
        {
          model: User,
          as: 'requester',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ exchangeRequests });
  } catch (error) {
    console.error('Get exchange requests error:', error);
    res.status(500).json({ msg: 'Failed to fetch exchange requests' });
  }
};

// Recent Activities
const getRecentActivities = async (req, res) => {
  try {
    const [recentUsers, recentBooks, recentOrders, recentExchanges] = await Promise.all([
      User.findAll({
        limit: 5,
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'name', 'email', 'createdAt']
      }),
      Book.findAll({
        limit: 5,
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'title', 'ownerId', 'exchangeType', 'createdAt']
      }),
      Order.findAll({
        limit: 5,
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'buyerId', 'sellerId', 'totalAmount', 'status', 'createdAt']
      }),
      ExchangeRequest.findAll({
        limit: 5,
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'requesterId', 'ownerId', 'status', 'createdAt']
      })
    ]);

    res.status(200).json({
      recentUsers,
      recentBooks,
      recentOrders,
      recentExchanges
    });
  } catch (error) {
    console.error('Get recent activities error:', error);
    res.status(500).json({ msg: 'Failed to fetch recent activities' });
  }
};

const getSellerListings = async (req, res) => {
  try {
    const { sellerId } = req.params;
    
    const seller = await User.findByPk(sellerId);
    if (!seller) {
      return res.status(404).json({ msg: 'Seller not found' });
    }

    const books = await Book.findAll({
      where: { ownerId: sellerId },
      order: [['createdAt', 'DESC']]
    });

    // Group books by exchange type
    const sellBooks = books.filter(b => b.exchangeType === 'Sell');
    const rentBooks = books.filter(b => b.exchangeType === 'Rent');
    const exchangeBooks = books.filter(b => b.exchangeType === 'Exchange');

    res.status(200).json({
      seller: {
        id: seller.id,
        name: seller.name,
        email: seller.email,
        phone: seller.phone,
        location: seller.location,
        createdAt: seller.createdAt,
        sellerStatus: seller.sellerStatus
      },
      books: {
        all: books,
        sell: sellBooks,
        rent: rentBooks,
        exchange: exchangeBooks
      },
      counts: {
        total: books.length,
        sell: sellBooks.length,
        rent: rentBooks.length,
        exchange: exchangeBooks.length
      }
    });
  } catch (error) {
    console.error('Get seller listings error:', error);
    res.status(500).json({ msg: 'Failed to fetch seller listings' });
  }
};

const removeBooksByTitlePattern = async (req, res) => {
  try {
    const { pattern } = req.params;
    
    const books = await Book.findAll({
      where: {
        title: {
          [Op.like]: `%${pattern}%`
        }
      }
    });

    console.log(`Found ${books.length} books matching pattern "${pattern}":`);
    books.forEach(book => {
      console.log(`- ID: ${book.id}, Title: "${book.title}"`);
    });

    if (books.length === 0) {
      return res.status(404).json({ msg: 'No books found matching the pattern' });
    }

    // Delete all matching books
    for (const book of books) {
      await book.destroy();
      console.log(`Deleted: ${book.title} (ID: ${book.id})`);
    }

    res.status(200).json({ 
      msg: `Successfully removed ${books.length} books matching pattern "${pattern}"`,
      deletedCount: books.length
    });
  } catch (error) {
    console.error('Remove books by pattern error:', error);
    res.status(500).json({ msg: 'Failed to remove books' });
  }
};

module.exports = {
  getDashboardStats,
  getSellerRequests,
  approveSellerRequest,
  rejectSellerRequest,
  getAllUsers,
  deactivateUser,
  activateUser,
  deleteUser,
  getAllSellers,
  getSellerListings,
  activateSeller,
  deactivateSeller,
  suspendSeller,
  getAllBooks,
  removeBook,
  hideBook,
  restoreBook,
  getAllOrders,
  getExchangeRequests,
  getRecentActivities,
  removeBooksByTitlePattern
};
