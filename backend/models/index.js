const User = require('./User');
const Book = require('./Book');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Transaction = require('./Transaction');
const Notification = require('./Notification');
const UserViewedBook = require('./UserViewedBook');
const Rent = require('./Rent');
const Exchange = require('./Exchange');
const ExchangeRequest = require('./ExchangeRequest');
const Review = require('./Review');

// Define Associations

// User <-> Book
User.hasMany(Book, { foreignKey: 'ownerId', as: 'books' });
Book.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

// Book <-> Rent
Book.hasOne(Rent, { foreignKey: 'bookId', as: 'rentDetails' });
Rent.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });

// Book <-> Exchange
Book.hasOne(Exchange, { foreignKey: 'bookId', as: 'exchangeDetails' });
Exchange.belongsTo(Book, { foreignKey: 'bookId', as: 'book' });

// User <-> Exchange
User.hasMany(Exchange, { foreignKey: 'ownerId', as: 'exchanges' });
Exchange.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

// ExchangeRequest associations
ExchangeRequest.belongsTo(User, { foreignKey: 'requesterId', as: 'requester' });
ExchangeRequest.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });
ExchangeRequest.belongsTo(Book, { foreignKey: 'requestedBookId', as: 'requestedBook' });
ExchangeRequest.belongsTo(Book, { foreignKey: 'offeredBookId', as: 'offeredBook' });

User.hasMany(ExchangeRequest, { foreignKey: 'requesterId', as: 'sentExchangeRequests' });
User.hasMany(ExchangeRequest, { foreignKey: 'ownerId', as: 'receivedExchangeRequests' });

// User <-> Notification
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> Order
User.hasMany(Order, { foreignKey: 'buyerId', as: 'buyerOrders' });
User.hasMany(Order, { foreignKey: 'sellerId', as: 'sellerOrders' });
Order.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });
Order.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

// User <-> Review
User.hasMany(Review, { foreignKey: 'sellerId', as: 'receivedReviews' });
User.hasMany(Review, { foreignKey: 'buyerId', as: 'writtenReviews' });
Review.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });
Review.belongsTo(User, { foreignKey: 'buyerId', as: 'buyer' });
Review.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

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
  UserViewedBook,
  Rent,
  Exchange,
  ExchangeRequest,
  Review
};
