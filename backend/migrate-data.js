require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { sequelize } = require('./db/connectPostgres');

// Import Sequelize models
const {
  User,
  Book,
  Order,
  OrderItem,
  Transaction,
  Notification,
  UserViewedBook
} = require('./models');

const backupDir = path.join(__dirname, 'backup');

async function migrate() {
  try {
    console.log('Synchronizing PostgreSQL tables...');
    // Force recreate tables
    await sequelize.sync({ force: true });
    console.log('Tables synchronized successfully.');

    // Disable foreign key constraint checks temporarily to allow clean import
    await sequelize.query('SET session_replication_role = replica;');
    console.log('Temporarily disabled foreign key constraint checks.');

    // 1. Migrate Users
    console.log('Migrating users...');
    const usersData = JSON.parse(fs.readFileSync(path.join(backupDir, 'users.json'), 'utf8'));
    
    const usersToInsert = [];
    const viewedBooksToInsert = [];

    for (const u of usersData) {
      const userRecord = {
        id: u._id,
        name: u.name || 'Unknown',
        email: u.email,
        password: u.password || '$2a$10$Fav9.X4npWlYvHklSb7yI.o6liKN3uLXzogQjfLv4PZ23yTykDdqq',
        role: u.role || 'customer',
        interests: Array.isArray(u.interests) && u.interests.length > 0 ? u.interests : ['Programming'],
        finance_totalEarnings: u.finance ? u.finance.totalEarnings : 0.00,
        finance_monthlyEarnings: u.finance ? u.finance.monthlyEarnings : 0.00,
        finance_completedOrdersRevenue: u.finance ? u.finance.completedOrdersRevenue : 0.00,
        isBlocked: u.isBlocked !== undefined ? u.isBlocked : false,
        complaintCount: u.complaintCount !== undefined ? u.complaintCount : 0,
        createdAt: u.createdAt || new Date(),
        updatedAt: u.updatedAt || new Date()
      };
      usersToInsert.push(userRecord);

      if (Array.isArray(u.viewedBooks)) {
        for (const vb of u.viewedBooks) {
          viewedBooksToInsert.push({
            userId: u._id,
            bookId: vb.book,
            category: vb.category || 'Other',
            views: vb.views !== undefined ? vb.views : 1,
            createdAt: vb.updatedAt || new Date(),
            updatedAt: vb.updatedAt || new Date()
          });
        }
      }
    }

    await User.bulkCreate(usersToInsert, { hooks: false, validate: false });
    console.log(`Successfully migrated ${usersToInsert.length} users.`);

    if (viewedBooksToInsert.length > 0) {
      await UserViewedBook.bulkCreate(viewedBooksToInsert, { validate: false });
      console.log(`Successfully migrated ${viewedBooksToInsert.length} user viewed book history records.`);
    }

    // 2. Migrate Books
    console.log('Migrating books...');
    const booksData = JSON.parse(fs.readFileSync(path.join(backupDir, 'books.json'), 'utf8'));
    const booksToInsert = [];

    for (const b of booksData) {
      booksToInsert.push({
        id: b._id,
        title: b.title,
        author: b.author,
        description: b.description || '',
        condition: b.condition || 'Used/Good',
        category: b.category || 'Other',
        exchangeType: b.exchangeType || 'Sell',
        price: b.price !== undefined ? b.price : 0,
        rentWeek: b.rentWeek !== undefined ? b.rentWeek : 0,
        rentMonth: b.rentMonth !== undefined ? b.rentMonth : 0,
        securityDeposit: b.securityDeposit !== undefined ? b.securityDeposit : 0,
        images: Array.isArray(b.images) ? b.images : [],
        image: b.image || null,
        pdf: b.pdf || null,
        subject: b.subject || null,
        duration: b.duration || null,
        status: b.status || 'Available',
        views: b.views !== undefined ? b.views : 0,
        ownerId: b.owner,
        createdAt: b.createdAt || new Date(),
        updatedAt: b.updatedAt || new Date()
      });
    }

    if (booksToInsert.length > 0) {
      await Book.bulkCreate(booksToInsert, { validate: false });
      console.log(`Successfully migrated ${booksToInsert.length} books.`);
    }

    // 3. Migrate Orders
    console.log('Migrating orders...');
    const ordersData = JSON.parse(fs.readFileSync(path.join(backupDir, 'orders.json'), 'utf8'));
    const ordersToInsert = [];
    const orderItemsToInsert = [];

    for (const o of ordersData) {
      ordersToInsert.push({
        id: o._id,
        buyerId: o.buyerId,
        sellerId: o.sellerId,
        bookAmount: o.bookAmount !== undefined ? o.bookAmount : 0,
        deliveryFee: o.deliveryFee !== undefined ? o.deliveryFee : 0,
        totalAmount: o.totalAmount !== undefined ? o.totalAmount : 0,
        shippingAddress: o.shippingAddress || null,
        shippingPhone: o.shippingPhone || null,
        shippingName: o.shippingName || null,
        trackingData: o.trackingData || {},
        paymentData: o.paymentData || {},
        status: o.status || 'pending',
        complainReason: o.complainReason || null,
        createdAt: o.createdAt || new Date(),
        updatedAt: o.updatedAt || new Date()
      });

      if (Array.isArray(o.items)) {
        for (const item of o.items) {
          orderItemsToInsert.push({
            orderId: o._id,
            bookId: item.bookId || null,
            title: item.title || null,
            type: item.type || 'buy',
            price: item.price !== undefined ? item.price : 0,
            quantity: item.quantity !== undefined ? item.quantity : 1
          });
        }
      }
    }

    if (ordersToInsert.length > 0) {
      await Order.bulkCreate(ordersToInsert, { validate: false });
      console.log(`Successfully migrated ${ordersToInsert.length} orders.`);
    }

    if (orderItemsToInsert.length > 0) {
      await OrderItem.bulkCreate(orderItemsToInsert, { validate: false });
      console.log(`Successfully migrated ${orderItemsToInsert.length} order items.`);
    }

    // 4. Migrate Transactions
    console.log('Migrating transactions...');
    const transactionsData = JSON.parse(fs.readFileSync(path.join(backupDir, 'transactions.json'), 'utf8'));
    const transactionsToInsert = [];

    for (const t of transactionsData) {
      transactionsToInsert.push({
        id: t._id,
        book: t.book,
        requester: t.requester,
        owner: t.owner,
        exchangeType: t.exchangeType,
        status: t.status || 'Pending',
        message: t.message || null,
        createdAt: t.createdAt || new Date(),
        updatedAt: t.updatedAt || new Date()
      });
    }

    if (transactionsToInsert.length > 0) {
      await Transaction.bulkCreate(transactionsToInsert, { validate: false });
      console.log(`Successfully migrated ${transactionsToInsert.length} transactions.`);
    }

    // 5. Migrate Notifications
    console.log('Migrating notifications...');
    const notificationsData = JSON.parse(fs.readFileSync(path.join(backupDir, 'notifications.json'), 'utf8'));
    const notificationsToInsert = [];

    for (const n of notificationsData) {
      notificationsToInsert.push({
        id: n._id,
        userId: n.userId,
        message: n.message,
        type: n.type || 'general',
        actionLink: n.actionLink || null,
        orderId: n.orderId || null,
        isRead: n.isRead !== undefined ? n.isRead : false,
        createdAt: n.createdAt || new Date(),
        updatedAt: n.updatedAt || new Date()
      });
    }

    if (notificationsToInsert.length > 0) {
      await Notification.bulkCreate(notificationsToInsert, { validate: false });
      console.log(`Successfully migrated ${notificationsToInsert.length} notifications.`);
    }

    // Re-enable foreign key constraints
    await sequelize.query('SET session_replication_role = default;');
    console.log('Re-enabled foreign key constraint checks.');

    console.log('Data migration to PostgreSQL completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    if (error.stack) {
      console.error(error.stack.split('\n').slice(0, 5).join('\n'));
    }
    process.exit(1);
  }
}

migrate();
