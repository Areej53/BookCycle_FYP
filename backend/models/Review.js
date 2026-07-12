const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../db/connectPostgres');

class Review extends Model {
  toJSON() {
    const values = { ...this.get() };
    values._id = values.id;
    return values;
  }
}

Review.init({
  id: {
    type: DataTypes.STRING(24),
    primaryKey: true,
    allowNull: false,
    defaultValue: () => require('crypto').randomBytes(12).toString('hex')
  },
  orderId: {
    type: DataTypes.STRING(24),
    allowNull: false,
    unique: {
      msg: "This order has already been reviewed"
    }
  },
  sellerId: {
    type: DataTypes.STRING(24),
    allowNull: false
  },
  buyerId: {
    type: DataTypes.STRING(24),
    allowNull: false
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: { args: [1], msg: "Rating must be at least 1" },
      max: { args: [10], msg: "Rating cannot exceed 10" }
    }
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Review',
  tableName: 'reviews',
  timestamps: true
});

module.exports = Review;
