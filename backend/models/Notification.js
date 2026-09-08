const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../db/connectPostgres');

class Notification extends Model {
  toJSON() {
    const values = { ...this.get() };
    values._id = values.id;
    return values;
  }
}

Notification.init({
  id: {
    type: DataTypes.STRING(24),
    primaryKey: true,
    allowNull: false,
    defaultValue: () => require('crypto').randomBytes(12).toString('hex')
  },
  userId: {
    type: DataTypes.STRING(24),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING(50),
    defaultValue: 'general',
    validate: {
      isIn: {
        args: [[
          "order",
          "rent",
          "system",
          "general",
          "order_update",
          "complaint",
          "seller_request_submitted",
          "seller_approved",
          "seller_rejected",
          "account_activated",
          "account_suspended",
          "exchange",
          "exchange_request"
        ]],
        msg: "Type is not supported"
      }
    }
  },
  actionLink: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  orderId: {
    type: DataTypes.STRING(24),
    allowNull: true
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  sequelize,
  modelName: 'Notification',
  tableName: 'notifications',
  timestamps: true
});

module.exports = Notification;
