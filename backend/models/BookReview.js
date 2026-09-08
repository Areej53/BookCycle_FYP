const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../db/connectPostgres');

class BookReview extends Model {
  toJSON() {
    const values = { ...this.get() };
    values._id = values.id;
    return values;
  }
}

BookReview.init({
  id: {
    type: DataTypes.STRING(24),
    primaryKey: true,
    allowNull: false,
    defaultValue: () => require('crypto').randomBytes(12).toString('hex')
  },
  bookId: {
    type: DataTypes.STRING(24),
    allowNull: false,
    references: {
      model: 'books',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.STRING(24),
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'BookReview',
  tableName: 'book_reviews',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['bookId', 'userId']
    }
  ]
});

module.exports = BookReview;