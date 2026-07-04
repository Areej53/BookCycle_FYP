const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../db/connectPostgres');

class Order extends Model {
  toJSON() {
    const values = { ...this.get() };
    values._id = values.id;
    return values;
  }
}

Order.init({
  id: {
    type: DataTypes.STRING(24),
    primaryKey: true,
    allowNull: false,
    defaultValue: () => require('crypto').randomBytes(12).toString('hex')
  },
  buyerId: {
    type: DataTypes.STRING(24),
    allowNull: false
  },
  sellerId: {
    type: DataTypes.STRING(24),
    allowNull: false
  },
  bookAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  deliveryFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  shippingAddress: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  shippingPhone: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  shippingName: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  trackingData: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  paymentData: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  status: {
    type: DataTypes.STRING(30),
    defaultValue: 'pending',
    validate: {
      isIn: {
        args: [[
          "pending",
          "pending_seller",
          "accepted",
          "rejected",
          "ride_assigned",
          "out_for_delivery",
          "delivered",
          "payment_submitted",
          "completed",
          "cancelled",
          "complain"
        ]],
        msg: "Status is not supported"
      }
    }
  },
  complainReason: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Order',
  tableName: 'orders',
  timestamps: true
});

module.exports = Order;
