const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../db/connectPostgres');

class OrderItem extends Model {}

OrderItem.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderId: {
    type: DataTypes.STRING(24),
    allowNull: false
  },
  bookId: {
    type: DataTypes.STRING(24),
    allowNull: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  type: {
    type: DataTypes.STRING(20),
    defaultValue: 'buy',
    validate: {
      isIn: {
        args: [['buy', 'rent', 'free']],
        msg: "Type is not supported"
      }
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  }
}, {
  sequelize,
  modelName: 'OrderItem',
  tableName: 'order_items',
  timestamps: false
});

module.exports = OrderItem;
