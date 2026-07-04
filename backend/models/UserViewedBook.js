const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../db/connectPostgres');

class UserViewedBook extends Model {}

UserViewedBook.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.STRING(24),
    allowNull: false
  },
  bookId: {
    type: DataTypes.STRING(24),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  }
}, {
  sequelize,
  modelName: 'UserViewedBook',
  tableName: 'user_viewed_books',
  timestamps: true // This adds createdAt and updatedAt automatically.
});

module.exports = UserViewedBook;
