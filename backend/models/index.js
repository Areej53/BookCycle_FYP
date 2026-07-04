const User = require('./User');
const Book = require('./Book');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Transaction = require('./Transaction');
const Notification = require('./Notification');
const UserViewedBook = require('./UserViewedBook');

// Define Associations

// User <-> Book
User.hasMany(Book, { foreignKey: 'ownerId', as: 'books' });
Book.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

// User <-> Notification
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> Order
User.hasMany(Order, { foreignKey: 'buyerId', as: 'buyerOrders' });
User.hasMany(Order, { foreignKey: 'sellerId', as: 'sellerOrders' });
Order.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });
Order.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

// Order <-> OrderItem
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });
OrderItem.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });

// Transaction associations
Transaction.belongsTo(Book, { foreignKey: 'book', as: 'bookDetails' });
Transaction.belongsTo(User, { foreignKey: 'requester', as: 'requesterUser' });
Transaction.belongsTo(User, { foreignKey: 'owner', as: 'ownerUser' });

// UserViewedBook join table associations
User.belongsToMany(Book, { through: UserViewedBook, foreignKey: 'userId', as: 'viewedBooksList' });
Book.belongsToMany(User, { through: UserViewedBook, foreignKey: 'bookId', as: 'viewers' });
User.hasMany(UserViewedBook, { foreignKey: 'userId', as: 'viewedBooks' });
UserViewedBook.belongsTo(User, { foreignKey: 'userId' });
UserViewedBook.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });

module.exports = {
  User,
  Book,
  Order,
  OrderItem,
  Transaction,
  Notification,
  UserViewedBook
};
