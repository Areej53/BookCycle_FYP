const { User, Book, Order, Exchange, ExchangeRequest, Notification, PaymentAuditLog, RiderApplication } = require("../models");
const { sequelize } = require("../db/connectPostgres");
const { Op } = require("sequelize");
const { notifyUserAndEmail, notifyAdminUsers } = require("../utils/notificationHelper");

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
      rawCategoryCounts,
      codTotalDue,
      codTotalCollected,
      codTotalDeposited,
      codPendingDeposit,
      codDiscrepancies,
      codSellerPayable,
      codRiderEarnings
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
      }),
      Order.sum('codAmountDue', { where: { paymentMethod: 'COD' } }),
      Order.sum('codAmountCollected', { where: { paymentMethod: 'COD' } }),
      Order.sum('depositAmount', { where: { paymentMethod: 'COD', depositStatus: 'DEPOSITED' } }),
      Order.count({ where: { paymentMethod: 'COD', paymentStatus: 'COD_COLLECTED' } }),
      Order.count({ where: { paymentMethod: 'COD', hasDiscrepancy: true, discrepancyResolved: false } }),
      Order.sum('sellerPayableAmount', { where: { paymentMethod: 'COD', sellerPayoutStatus: 'PENDING' } }),
      Order.sum('riderEarningAmount', { where: { paymentMethod: 'COD', riderPayoutStatus: 'PENDING' } })
    ]).catch(err => {
      console.error('Stats query error:', err);
      return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, [], 0, 0, 0, 0, 0, 0, 0, 0];
    });

    const categoryCounts = {};
    if (Array.isArray(rawCategoryCounts)) {
      rawCategoryCounts.forEach(item => {
        if (item.category) {
          categoryCounts[item.category] = parseInt(item.count, 10) || 0;
        }
      });
    }

    // Fetch active rental orders with rental information
    let activeRentals = [];
    try {
      activeRentals = await Order.findAll({
        where: {
          orderType: 'RENT',
          deliveryStatus: {
            [Op.in]: [
              'RENTAL_PERIOD_ACTIVE',
              'RENTAL_EXPIRED',
              'GOING_TO_COLLECT',
              'NEAR_COLLECTION',
              'COLLECTED',
              'RETURNING_TO_SELLER',
              'NEAR_SELLER'
            ]
          }
        },
        include: [
          { model: User, as: 'buyer', attributes: ['id', 'name', 'email', 'phone', 'address', 'city'] },
          { model: User, as: 'seller', attributes: ['id', 'name', 'email', 'phone', 'address', 'city'] },
          {
            model: OrderItem,
            as: 'items',
            include: [{ model: Book, as: 'book', attributes: ['id', 'title', 'image', 'price'] }]
          }
        ],
        order: [['updatedAt', 'DESC']]
      });

      for (const o of activeRentals) {
        if (o.items) {
          for (const item of o.items) {
            if (item.bookId) {
              const rent = await Rent.findOne({ where: { bookId: item.bookId } });
              if (rent && rent.rentalEndDate) {
                const now = new Date();
                const endDate = new Date(rent.rentalEndDate);
                const diffTime = endDate - now;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const diffMonths = Math.floor(diffDays / 30);
                const remainingDays = diffDays % 30;
                
                let timeRemaining = '';
                if (diffDays <= 0) {
                  timeRemaining = 'Expired';
                } else if (diffMonths > 0) {
                  timeRemaining = diffMonths === 1 ? '1 month' : `${diffMonths} months`;
                  if (remainingDays > 0) {
                    timeRemaining += ` ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
                  }
                } else {
                  timeRemaining = `${diffDays} day${diffDays > 1 ? 's' : ''}`;
                }

                let deliveryDate = rent.rentalStartDate;
                if (o.trackingData) {
                  try {
                    const trackingData = typeof o.trackingData === 'string' ? JSON.parse(o.trackingData) : o.trackingData;
                    if (trackingData && trackingData.deliveryDate) {
                      deliveryDate = new Date(trackingData.deliveryDate);
                    }
                  } catch (e) {}
                }

                const rInfo = {
                  rentalDuration: rent.rentalDuration,
                  rentalStartDate: rent.rentalStartDate,
                  rentalEndDate: rent.rentalEndDate,
                  deliveryDate: deliveryDate,
                  timeRemaining,
                  daysRemaining: diffDays > 0 ? diffDays : 0,
                  isExpired: diffTime <= 0
                };
                if (item.dataValues) item.dataValues.rentalInfo = rInfo;
                item.rentalInfo = rInfo;
                if (o.dataValues) o.dataValues.rentalInfo = rInfo;
                o.rentalInfo = rInfo;
              }
            }
          }
        }
      }
    } catch (rErr) {
      console.error('Error fetching active rentals for dashboard:', rErr);
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
      categoryCounts,
      activeRentals,
      codStats: {
        totalDue: codTotalDue || 0,
        totalCollected: codTotalCollected || 0,
        totalDeposited: codTotalDeposited || 0,
        pendingDeposit: codPendingDeposit || 0,
        discrepancies: codDiscrepancies || 0,
        sellerPayable: codSellerPayable || 0,
        riderEarnings: codRiderEarnings || 0
      }
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
      attributes: ['id', 'name', 'email', 'phone', 'address', 'city', 'sellerRequestDate', 'createdAt'],
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
    const { RiderApplication, OrderItem, Book, DeliveryStatusHistory, Rent } = require('../models');
    const orders = await Order.findAll({
      include: [
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'name', 'email', 'phone', 'address', 'city']
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'email', 'phone', 'address', 'city']
        },
        {
          model: User,
          as: 'rider',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: RiderApplication,
          as: 'riderProfile',
          attributes: ['id', 'fullName', 'phone', 'vehicleType', 'vehicleNumber', 'isRiderActive']
        },
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Book, as: 'book', attributes: ['id', 'title', 'image', 'price'] }]
        },
        {
          model: DeliveryStatusHistory,
          as: 'statusHistory'
        },
        {
          model: PaymentAuditLog,
          as: 'paymentHistory'
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Add rental period info for RENT orders
    for (const order of orders) {
      if (order.orderType === 'RENT' && order.items) {
        for (const item of order.items) {
          if (item.bookId) {
            const rent = await Rent.findOne({ where: { bookId: item.bookId } });
            if (rent && rent.rentalEndDate) {
              const now = new Date();
              const endDate = new Date(rent.rentalEndDate);
              const diffTime = endDate - now;
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              const diffMonths = Math.floor(diffDays / 30);
              const remainingDays = diffDays % 30;
              
              let timeRemaining = '';
              if (diffDays <= 0) {
                timeRemaining = 'Expired';
              } else if (diffMonths > 0) {
                timeRemaining = diffMonths === 1 ? '1 month' : `${diffMonths} months`;
                if (remainingDays > 0) {
                  timeRemaining += ` ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
                }
              } else {
                timeRemaining = `${diffDays} day${diffDays > 1 ? 's' : ''}`;
              }
              
              // Get delivery date from trackingData
              let deliveryDate = rent.rentalStartDate;
              if (order.trackingData) {
                try {
                  const trackingData = JSON.parse(order.trackingData);
                  if (trackingData.deliveryDate) {
                    deliveryDate = new Date(trackingData.deliveryDate);
                  }
                } catch (e) {
                  // Use rentalStartDate if trackingData is invalid
                }
              }
              
              const rInfo = {
                rentalDuration: rent.rentalDuration,
                rentalStartDate: rent.rentalStartDate,
                rentalEndDate: rent.rentalEndDate,
                deliveryDate: deliveryDate,
                timeRemaining,
                daysRemaining: diffDays > 0 ? diffDays : 0,
                isExpired: diffDays <= 0
              };
              item.rentalInfo = rInfo;
              if (item.dataValues) item.dataValues.rentalInfo = rInfo;
              if (order.dataValues) order.dataValues.rentalInfo = rInfo;
              order.rentalInfo = rInfo;
            }
          }
        }
      }
    }

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

// Helper: Check if all payment, deposit, and payout obligations are reconciled, then mark order SETTLED
const checkAndSetSettled = async (order, adminId) => {
  try {
    // 1. Cash must have been recorded and verified as DEPOSITED
    if (order.depositStatus !== 'DEPOSITED' && order.paymentStatus !== 'DEPOSITED') {
      return false;
    }

    // 2. Any collection discrepancy must be resolved
    if (order.hasDiscrepancy && !order.discrepancyResolved) {
      return false;
    }

    // 3. Seller payout must be paid if sellerPayableAmount > 0
    if (Number(order.sellerPayableAmount) > 0 && order.sellerPayoutStatus !== 'PAID') {
      return false;
    }

    // 4. Rider payout must be paid if riderEarningAmount > 0
    if (Number(order.riderEarningAmount) > 0 && order.riderPayoutStatus !== 'PAID') {
      return false;
    }

    // 5. Refundable security deposit must be resolved (not currently HELD)
    if (Number(order.securityDeposit) > 0 && order.securityDepositStatus === 'HELD') {
      return false;
    }

    const prevStatus = order.paymentStatus;
    if (prevStatus === 'SETTLED') return true;

    order.paymentStatus = 'SETTLED';
    await order.save();

    await PaymentAuditLog.create({
      orderId: order.id,
      action: 'ORDER_SETTLED',
      amount: Number(order.depositAmount) || Number(order.codAmountCollected) || 0,
      performedBy: adminId || 'admin',
      performedByRole: 'admin',
      previousPaymentStatus: prevStatus,
      newPaymentStatus: 'SETTLED',
      note: 'All payment, cash deposit, seller payout, and rider delivery earning obligations have been fully reconciled and settled.'
    });

    return true;
  } catch (err) {
    console.error('checkAndSetSettled error:', err);
    return false;
  }
};

// COD Payment Management - Record Cash Deposit
const recordCashDeposit = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { orderId } = req.params;
    const { depositAmount, notes } = req.body;

    const order = await Order.findByPk(orderId, {
      include: [
        { model: User, as: 'buyer' },
        { model: User, as: 'seller' },
        { model: User, as: 'rider' },
        { model: PaymentAuditLog, as: 'paymentHistory' }
      ]
    });

    if (!order) {
      return res.status(404).json({ msg: 'Order not found.' });
    }

    // Only allow if payment has been collected by rider
    if (order.paymentStatus !== 'COD_COLLECTED' && order.paymentStatus !== 'DEPOSIT_PENDING') {
      return res.status(400).json({ msg: `Cannot record deposit. Current payment status is ${order.paymentStatus}. Must be COD_COLLECTED or DEPOSIT_PENDING.` });
    }

    const previousStatus = order.paymentStatus;
    const actualDeposit = Number(depositAmount) != null && !isNaN(Number(depositAmount)) && Number(depositAmount) > 0
      ? Number(depositAmount)
      : Number(order.codAmountCollected) || 0;

    order.depositAmount = actualDeposit;
    order.depositedAt = new Date();
    order.depositedBy = adminId;
    order.depositStatus = 'DEPOSITED';
    order.paymentStatus = 'DEPOSITED';

    if (order.hasDiscrepancy && !order.discrepancyResolved) {
      order.discrepancyResolved = true;
      order.reconciliationNotes = (order.reconciliationNotes ? order.reconciliationNotes + '; ' : '') + (notes || `Admin reconciled discrepancy. Deposited Rs. ${actualDeposit}.`);
    }

    await order.save();

    // Record in PaymentAuditLog
    await PaymentAuditLog.create({
      orderId: order.id,
      action: 'CASH_DEPOSITED',
      amount: actualDeposit,
      performedBy: adminId,
      performedByRole: 'admin',
      previousPaymentStatus: previousStatus,
      newPaymentStatus: 'DEPOSITED',
      note: `Admin recorded cash deposit of Rs. ${actualDeposit} from rider. ${notes || ''}`.trim()
    });

    // Notify Rider of verified cash deposit
    if (order.riderId) {
      const rider = order.rider || (await User.findByPk(order.riderId));
      if (rider && rider.email) {
        await notifyUserAndEmail({
          userId: order.riderId,
          userEmail: rider.email,
          userPhone: rider.phone,
          subject: `Cash Deposit Verified - Order #${order.id}`,
          message: `BookCycle Admin has verified and received your collected cash deposit of Rs. ${actualDeposit} for Order #${order.id}. Thank you!`,
          type: "delivery",
          orderId: order.id
        });
      }
    }

    // Notify Seller that cash is deposited with Admin
    if (order.sellerId) {
      const seller = order.seller || (await User.findByPk(order.sellerId));
      if (seller && seller.email) {
        await notifyUserAndEmail({
          userId: order.sellerId,
          userEmail: seller.email,
          userPhone: seller.phone,
          subject: `Payment Deposited with Admin - Order #${order.id}`,
          message: `Order #${order.id} COD cash has been deposited with BookCycle Admin. Your seller payout of Rs. ${order.sellerPayableAmount || 0} is queued for disbursement.`,
          type: "order",
          orderId: order.id
        });
      }
    }

    // Check if order obligations are now completely settled
    await checkAndSetSettled(order, adminId);

    const reloadedOrder = await Order.findByPk(orderId, {
      include: [
        { model: User, as: 'buyer' },
        { model: User, as: 'seller' },
        { model: User, as: 'rider' },
        { model: PaymentAuditLog, as: 'paymentHistory' }
      ]
    });

    res.status(200).json({
      msg: `Cash deposit of Rs. ${actualDeposit} verified and recorded successfully.`,
      order: reloadedOrder ? reloadedOrder.toJSON() : order.toJSON()
    });
  } catch (error) {
    console.error('Record cash deposit error:', error);
    res.status(500).json({ msg: 'Failed to record cash deposit.', error: error.message });
  }
};

// COD Payment Management - Resolve Discrepancy
const resolveDiscrepancy = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { orderId } = req.params;
    const { resolutionAction, adjustedAmount, notes } = req.body;

    const order = await Order.findByPk(orderId, {
      include: [
        { model: User, as: 'buyer' },
        { model: User, as: 'seller' },
        { model: PaymentAuditLog, as: 'paymentHistory' }
      ]
    });

    if (!order) {
      return res.status(404).json({ msg: 'Order not found.' });
    }

    if (!order.hasDiscrepancy) {
      return res.status(400).json({ msg: 'This order has no discrepancy to resolve.' });
    }

    const previousStatus = order.paymentStatus;
    let newStatus = previousStatus;

    if (resolutionAction === 'accept_collected') {
      newStatus = 'DEPOSITED';
      order.depositAmount = Number(order.codAmountCollected) || 0;
      order.depositedAt = new Date();
      order.depositedBy = adminId;
      order.depositStatus = 'DEPOSITED';
      order.discrepancyResolved = true;
    } else if (resolutionAction === 'adjust') {
      const adjusted = Number(adjustedAmount) || 0;
      order.codAmountCollected = adjusted;
      order.depositAmount = adjusted;
      order.depositedAt = new Date();
      order.depositedBy = adminId;
      order.depositStatus = 'DEPOSITED';
      order.discrepancyResolved = true;
      newStatus = 'DEPOSITED';
    } else if (resolutionAction === 'pending_review') {
      newStatus = 'DEPOSIT_PENDING';
      order.discrepancyResolved = false;
    }

    order.reconciliationNotes = (order.reconciliationNotes ? order.reconciliationNotes + '; ' : '') + (notes || `Admin resolved discrepancy with action: ${resolutionAction}.`);
    order.paymentStatus = newStatus;

    await order.save();

    // Record in PaymentAuditLog
    await PaymentAuditLog.create({
      orderId: order.id,
      action: 'DISCREPANCY_RESOLVED',
      amount: order.depositAmount || order.codAmountCollected || 0,
      performedBy: adminId,
      performedByRole: 'admin',
      previousPaymentStatus: previousStatus,
      newPaymentStatus: newStatus,
      note: `Admin resolved discrepancy. Action: ${resolutionAction}. ${notes || ''}`.trim()
    });

    if (newStatus === 'DEPOSITED') {
      await checkAndSetSettled(order, adminId);
    }

    const reloadedOrder = await Order.findByPk(orderId, {
      include: [
        { model: User, as: 'buyer' },
        { model: User, as: 'seller' },
        { model: User, as: 'rider' },
        { model: PaymentAuditLog, as: 'paymentHistory' }
      ]
    });

    res.status(200).json({
      msg: `Discrepancy resolved successfully with action: ${resolutionAction}.`,
      order: reloadedOrder ? reloadedOrder.toJSON() : order.toJSON()
    });
  } catch (error) {
    console.error('Resolve discrepancy error:', error);
    res.status(500).json({ msg: 'Failed to resolve discrepancy.', error: error.message });
  }
};

// COD Payment Management - Record Seller Payout
const recordSellerPayout = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { orderId } = req.params;
    const { payoutAmount, notes } = req.body;

    const order = await Order.findByPk(orderId, {
      include: [
        { model: User, as: 'seller' },
        { model: PaymentAuditLog, as: 'paymentHistory' }
      ]
    });

    if (!order) {
      return res.status(404).json({ msg: 'Order not found.' });
    }

    // Only allow if payment has been deposited or settled
    if (order.paymentStatus !== 'DEPOSITED' && order.paymentStatus !== 'SETTLED') {
      return res.status(400).json({ msg: `Cannot record seller payout. Cash must be DEPOSITED first (current status: ${order.paymentStatus}).` });
    }

    if (order.sellerPayoutStatus === 'PAID') {
      return res.status(400).json({ msg: 'Seller has already been paid for this order.' });
    }

    const actualPayout = Number(payoutAmount) || Number(order.sellerPayableAmount) || 0;

    order.sellerPaidAt = new Date();
    order.sellerPayoutStatus = 'PAID';
    order.reconciliationNotes = (order.reconciliationNotes ? order.reconciliationNotes + '; ' : '') + (notes || `Admin paid seller Rs. ${actualPayout}.`);

    await order.save();

    // Update seller user finance record accurately without duplicate credit
    const seller = await User.findByPk(order.sellerId);
    if (seller) {
      seller.finance_totalEarnings = Number(seller.finance_totalEarnings || 0) + actualPayout;
      seller.finance_monthlyEarnings = Number(seller.finance_monthlyEarnings || 0) + actualPayout;
      seller.finance_completedOrdersRevenue = Number(seller.finance_completedOrdersRevenue || 0) + actualPayout;
      await seller.save();
    }

    // Record in PaymentAuditLog
    await PaymentAuditLog.create({
      orderId: order.id,
      action: 'SELLER_PAYOUT',
      amount: actualPayout,
      performedBy: adminId,
      performedByRole: 'admin',
      previousPaymentStatus: order.paymentStatus,
      newPaymentStatus: order.paymentStatus,
      note: `Admin processed seller payout of Rs. ${actualPayout}. ${notes || ''}`.trim()
    });

    // Notify Seller on Gmail and in-app
    if (order.sellerId && seller && seller.email) {
      await notifyUserAndEmail({
        userId: order.sellerId,
        userEmail: seller.email,
        userPhone: seller.phone,
        subject: `Payment Received from BookCycle Admin - Order #${order.id}`,
        message: `BookCycle Admin ki taraf se aapko Order #${order.id} ki payment (Rs. ${actualPayout}) transfer kar di gayi hai. Your payout of Rs. ${actualPayout} has been successfully recorded and processed by BookCycle Admin. Thank you!`,
        type: "payout",
        orderId: order.id
      });
    }

    // Check if order is now settled
    await checkAndSetSettled(order, adminId);

    const reloadedOrder = await Order.findByPk(orderId, {
      include: [
        { model: User, as: 'seller' },
        { model: PaymentAuditLog, as: 'paymentHistory' }
      ]
    });

    res.status(200).json({
      msg: `Seller payout of Rs. ${actualPayout} recorded successfully.`,
      order: reloadedOrder ? reloadedOrder.toJSON() : order.toJSON()
    });
  } catch (error) {
    console.error('Record seller payout error:', error);
    res.status(500).json({ msg: 'Failed to record seller payout.', error: error.message });
  }
};

// COD Payment Management - Record Rider Payout
const recordRiderPayout = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { orderId } = req.params;
    const { payoutAmount, notes } = req.body;

    const order = await Order.findByPk(orderId, {
      include: [
        { model: User, as: 'rider' },
        { model: PaymentAuditLog, as: 'paymentHistory' }
      ]
    });

    if (!order) {
      return res.status(404).json({ msg: 'Order not found.' });
    }

    // Only allow if payment has been deposited or settled
    if (order.paymentStatus !== 'DEPOSITED' && order.paymentStatus !== 'SETTLED') {
      return res.status(400).json({ msg: `Cannot record rider payout. Cash must be DEPOSITED first (current status: ${order.paymentStatus}).` });
    }

    if (order.riderPayoutStatus === 'PAID') {
      return res.status(400).json({ msg: 'Rider has already been paid for this order.' });
    }

    const actualPayout = Number(payoutAmount) || Number(order.riderEarningAmount) || 0;

    order.riderPaidAt = new Date();
    order.riderPayoutStatus = 'PAID';
    order.reconciliationNotes = (order.reconciliationNotes ? order.reconciliationNotes + '; ' : '') + (notes || `Admin paid rider Rs. ${actualPayout}.`);

    await order.save();

    // Record in PaymentAuditLog
    await PaymentAuditLog.create({
      orderId: order.id,
      action: 'RIDER_PAYOUT',
      amount: actualPayout,
      performedBy: adminId,
      performedByRole: 'admin',
      previousPaymentStatus: order.paymentStatus,
      newPaymentStatus: order.paymentStatus,
      note: `Admin processed delivery earning payout of Rs. ${actualPayout} to rider. ${notes || ''}`.trim()
    });

    // Notify Rider on Gmail and in-app
    const rider = order.rider || (order.riderId ? await User.findByPk(order.riderId) : null);
    if (order.riderId && rider && rider.email) {
      await notifyUserAndEmail({
        userId: order.riderId,
        userEmail: rider.email,
        userPhone: rider.phone,
        subject: `Payment Received from BookCycle Admin - Order #${order.id}`,
        message: `BookCycle Admin ki taraf se aapko Order #${order.id} ki delivery earning payment (Rs. ${actualPayout}) transfer kar di gayi hai. Your delivery payout of Rs. ${actualPayout} has been successfully recorded and processed by BookCycle Admin. Thank you!`,
        type: "payout",
        orderId: order.id
      });
    }

    // Check if order is now settled
    await checkAndSetSettled(order, adminId);

    const reloadedOrder = await Order.findByPk(orderId, {
      include: [
        { model: User, as: 'rider' },
        { model: PaymentAuditLog, as: 'paymentHistory' }
      ]
    });

    res.status(200).json({
      msg: `Rider payout of Rs. ${actualPayout} recorded successfully.`,
      order: reloadedOrder ? reloadedOrder.toJSON() : order.toJSON()
    });
  } catch (error) {
    console.error('Record rider payout error:', error);
    res.status(500).json({ msg: 'Failed to record rider payout.', error: error.message });
  }
};

// COD Payment Management - Resolve Rental Security Deposit
const resolveSecurityDeposit = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { orderId } = req.params;
    const { action, deductionAmount, notes } = req.body; // action: 'refund', 'deduct', 'forfeit'

    const order = await Order.findByPk(orderId, {
      include: [
        { model: User, as: 'buyer' },
        { model: PaymentAuditLog, as: 'paymentHistory' }
      ]
    });

    if (!order) {
      return res.status(404).json({ msg: 'Order not found.' });
    }

    if (order.orderType !== 'RENT' || Number(order.securityDeposit) <= 0) {
      return res.status(400).json({ msg: 'This order does not have a refundable rental security deposit.' });
    }

    if (order.securityDepositStatus !== 'HELD') {
      return res.status(400).json({ msg: `Security deposit status is already ${order.securityDepositStatus}.` });
    }

    const previousStatus = order.securityDepositStatus;
    let newDepositStatus = 'REFUNDED';
    const depositTotal = Number(order.securityDeposit) || 0;

    if (action === 'refund') {
      newDepositStatus = 'REFUNDED';
      order.securityDepositStatus = 'REFUNDED';
      order.refundAmount = Number(order.refundAmount || 0) + depositTotal;
      order.refundedAt = new Date();
      order.refundReason = notes || 'Refundable rental security deposit returned to customer after book return.';
    } else if (action === 'deduct') {
      const deduction = Number(deductionAmount) || 0;
      newDepositStatus = 'DEDUCTED';
      order.securityDepositStatus = 'DEDUCTED';
      const actualRefund = Math.max(0, depositTotal - deduction);
      if (actualRefund > 0) {
        order.refundAmount = Number(order.refundAmount || 0) + actualRefund;
        order.refundedAt = new Date();
        order.refundReason = `Security deposit partially refunded after damage deduction of Rs. ${deduction}. ${notes || ''}`;
      }
    } else if (action === 'forfeit') {
      newDepositStatus = 'FORFEITED';
      order.securityDepositStatus = 'FORFEITED';
    }

    order.reconciliationNotes = (order.reconciliationNotes ? order.reconciliationNotes + '; ' : '') + `Security deposit resolved: ${newDepositStatus}. ${notes || ''}`;
    await order.save();

    await PaymentAuditLog.create({
      orderId: order.id,
      action: 'SECURITY_DEPOSIT_' + newDepositStatus,
      amount: depositTotal,
      performedBy: adminId,
      performedByRole: 'admin',
      previousPaymentStatus: order.paymentStatus,
      newPaymentStatus: order.paymentStatus,
      note: `Security deposit ${newDepositStatus.toLowerCase()} by Admin. ${notes || ''}`.trim()
    });

    if (action === 'refund' && order.buyerId) {
      await notifyUserAndEmail({
        userId: order.buyerId,
        userEmail: order.buyer?.email,
        userPhone: order.shippingPhone || order.buyer?.phone,
        subject: `Security Deposit Refunded - Order #${order.id}`,
        message: `Your refundable rental security deposit of Rs. ${depositTotal} for Order #${order.id} has been refunded.`,
        type: 'refund',
        orderId: order.id,
        sendSmsFlag: true
      });
    }

    await checkAndSetSettled(order, adminId);

    const reloaded = await Order.findByPk(orderId, {
      include: [
        { model: User, as: 'buyer' },
        { model: User, as: 'seller' },
        { model: PaymentAuditLog, as: 'paymentHistory' }
      ]
    });

    res.status(200).json({
      msg: `Security deposit resolved as ${newDepositStatus}.`,
      order: reloaded ? reloaded.toJSON() : order.toJSON()
    });
  } catch (error) {
    console.error('Resolve security deposit error:', error);
    res.status(500).json({ msg: 'Failed to resolve security deposit.', error: error.message });
  }
};

// COD Payment Management - Process Refund
const processRefund = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { orderId } = req.params;
    const { refundAmount, refundReason, notes } = req.body;

    const order = await Order.findByPk(orderId, {
      include: [
        { model: User, as: 'buyer' },
        { model: PaymentAuditLog, as: 'paymentHistory' }
      ]
    });

    if (!order) {
      return res.status(404).json({ msg: 'Order not found.' });
    }

    // Cannot refund if cash has not been collected
    if (order.paymentStatus === 'COD_PENDING') {
      return res.status(400).json({ msg: 'Cannot process refund. Cash has not been collected from customer yet.' });
    }

    const actualRefund = Number(refundAmount) || 0;
    if (actualRefund <= 0) {
      return res.status(400).json({ msg: 'Please provide a valid refund amount.' });
    }

    const previousStatus = order.paymentStatus;
    let newStatus = previousStatus;

    if (actualRefund >= Number(order.codAmountCollected)) {
      newStatus = 'REFUNDED';
    } else {
      newStatus = 'PARTIALLY_REFUNDED';
    }

    order.refundAmount = Number(order.refundAmount || 0) + actualRefund;
    order.refundedAt = new Date();
    order.refundReason = refundReason || notes || 'Admin initiated refund';
    order.paymentStatus = newStatus;
    order.reconciliationNotes = (order.reconciliationNotes ? order.reconciliationNotes + '; ' : '') + (notes || `Admin processed refund of Rs. ${actualRefund}. Reason: ${refundReason || 'N/A'}`);

    await order.save();

    // Record in PaymentAuditLog
    await PaymentAuditLog.create({
      orderId: order.id,
      action: actualRefund >= Number(order.codAmountCollected) ? 'FULL_REFUND' : 'PARTIAL_REFUND',
      amount: actualRefund,
      performedBy: adminId,
      performedByRole: 'admin',
      previousPaymentStatus: previousStatus,
      newPaymentStatus: newStatus,
      note: `Admin processed refund of Rs. ${actualRefund}. Reason: ${refundReason || 'N/A'}. ${notes || ''}`.trim()
    });

    // Notify Buyer
    if (order.buyerId) {
      await notifyUserAndEmail({
        userId: order.buyerId,
        userEmail: order.buyer?.email,
        userPhone: order.shippingPhone || order.buyer?.phone,
        subject: `Refund Processed - Order #${order.id}`,
        message: `BookCycle has processed a refund of Rs. ${actualRefund} for Order #${order.id}. Reason: ${refundReason || 'N/A'}.`,
        type: "refund",
        orderId: order.id,
        sendSmsFlag: true
      });
    }

    const reloadedOrder = await Order.findByPk(orderId, {
      include: [
        { model: User, as: 'buyer' },
        { model: PaymentAuditLog, as: 'paymentHistory' }
      ]
    });

    res.status(200).json({
      msg: `Refund of Rs. ${actualRefund} processed successfully.`,
      order: reloadedOrder ? reloadedOrder.toJSON() : order.toJSON()
    });
  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({ msg: 'Failed to process refund.', error: error.message });
  }
};

// COD Payment Management - Get Order Payment Audit History
const getOrderPaymentHistory = async (req, res) => {
  try {
    const { orderId } = req.params;
    const history = await PaymentAuditLog.findAll({
      where: { orderId },
      include: [
        { model: User, as: 'performer', attributes: ['id', 'name', 'role', 'email'] }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.status(200).json({ history });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ msg: 'Failed to fetch payment history.', error: error.message });
  }
};

// COD Payment Management - Get Payment Summary & COD Orders
const getPaymentSummary = async (req, res) => {
  try {
    const [
      summaryStats,
      byStatus,
      discrepancies,
      codOrders,
      totalPendingDepositSum,
      totalSellerPaidSum,
      totalRiderPaidSum
    ] = await Promise.all([
      Order.findAll({
        attributes: [
          [sequelize.fn('COUNT', sequelize.col('id')), 'totalOrders'],
          [sequelize.fn('SUM', sequelize.col('codAmountDue')), 'totalAmountDue'],
          [sequelize.fn('SUM', sequelize.col('codAmountCollected')), 'totalCollected'],
          [sequelize.fn('SUM', sequelize.col('depositAmount')), 'totalDeposited'],
          [sequelize.fn('SUM', sequelize.col('sellerPayableAmount')), 'totalSellerPayable'],
          [sequelize.fn('SUM', sequelize.col('riderEarningAmount')), 'totalRiderEarnings'],
          [sequelize.fn('SUM', sequelize.col('platformCommission')), 'totalCommission'],
          [sequelize.fn('SUM', sequelize.col('securityDeposit')), 'totalSecurityDeposits'],
          [sequelize.fn('SUM', sequelize.col('refundAmount')), 'totalRefunds']
        ],
        where: { paymentMethod: 'COD' },
        raw: true
      }),
      Order.findAll({
        attributes: [
          'paymentStatus',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('codAmountCollected')), 'totalCollected']
        ],
        where: { paymentMethod: 'COD' },
        group: ['paymentStatus'],
        raw: true
      }),
      Order.findAll({
        where: {
          paymentMethod: 'COD',
          hasDiscrepancy: true,
          discrepancyResolved: false
        },
        include: [
          { model: User, as: 'rider', attributes: ['id', 'name', 'phone'] },
          { model: User, as: 'buyer', attributes: ['id', 'name', 'phone'] },
          { model: PaymentAuditLog, as: 'paymentHistory' }
        ],
        order: [['codCollectedAt', 'DESC']]
      }),
      Order.findAll({
        where: { paymentMethod: 'COD' },
        include: [
          { model: User, as: 'buyer', attributes: ['id', 'name', 'email', 'phone', 'address', 'city'] },
          { model: User, as: 'seller', attributes: ['id', 'name', 'email', 'phone', 'address', 'city', 'pickupAddress'] },
          { model: User, as: 'rider', attributes: ['id', 'name', 'email', 'phone'] },
          { model: RiderApplication, as: 'riderProfile', attributes: ['id', 'fullName', 'phone', 'vehicleType', 'vehicleNumber'] },
          { model: OrderItem, as: 'items', include: [{ model: Book, as: 'book', attributes: ['id', 'title', 'price', 'image'] }] },
          { model: PaymentAuditLog, as: 'paymentHistory' },
          { model: DeliveryStatusHistory, as: 'statusHistory' }
        ],
        order: [['createdAt', 'DESC']]
      }),
      Order.sum('codAmountCollected', {
        where: {
          paymentMethod: 'COD',
          paymentStatus: { [Op.in]: ['COD_COLLECTED', 'DEPOSIT_PENDING'] },
          depositStatus: { [Op.ne]: 'DEPOSITED' }
        }
      }),
      Order.sum('sellerPayableAmount', {
        where: {
          paymentMethod: 'COD',
          sellerPayoutStatus: 'PAID'
        }
      }),
      Order.sum('riderEarningAmount', {
        where: {
          paymentMethod: 'COD',
          riderPayoutStatus: 'PAID'
        }
      })
    ]);

    const baseSummary = summaryStats[0] || {};
    const totalCollectedVal = Number(baseSummary.totalCollected) || 0;
    const totalDepositedVal = Number(baseSummary.totalDeposited) || 0;
    const calculatedPendingDeposit = totalPendingDepositSum != null
      ? Number(totalPendingDepositSum)
      : Math.max(0, totalCollectedVal - totalDepositedVal);

    const fullSummary = {
      ...baseSummary,
      totalPendingDeposit: calculatedPendingDeposit,
      totalSellerPaid: Number(totalSellerPaidSum) || 0,
      totalSellerPending: Math.max(0, (Number(baseSummary.totalSellerPayable) || 0) - (Number(totalSellerPaidSum) || 0)),
      totalRiderPaid: Number(totalRiderPaidSum) || 0,
      totalRiderPending: Math.max(0, (Number(baseSummary.totalRiderEarnings) || 0) - (Number(totalRiderPaidSum) || 0))
    };

    res.status(200).json({
      summary: fullSummary,
      byStatus,
      discrepancies,
      orders: codOrders
    });
  } catch (error) {
    console.error('Get payment summary error:', error);
    res.status(500).json({ msg: 'Failed to fetch payment summary.', error: error.message });
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
  recordCashDeposit,
  resolveDiscrepancy,
  recordSellerPayout,
  recordRiderPayout,
  resolveSecurityDeposit,
  processRefund,
  getOrderPaymentHistory,
  getPaymentSummary,
  getRecentActivities,
  removeBooksByTitlePattern
};
