const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../db/connectPostgres');

class DeliveryStatusHistory extends Model {
  toJSON() {
    const values = { ...this.get() };
    values._id = values.id;
    return values;
  }
}

DeliveryStatusHistory.init({
  id: {
    type: DataTypes.STRING(24),
    primaryKey: true,
    allowNull: false,
    defaultValue: () => require('crypto').randomBytes(12).toString('hex')
  },
  orderId: {
    type: DataTypes.STRING(24),
    allowNull: false
  },
  riderId: {
    type: DataTypes.STRING(24),
    allowNull: true
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  updatedBy: {
    type: DataTypes.STRING(24),
    allowNull: true
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'DeliveryStatusHistory',
  tableName: 'delivery_status_histories',
  timestamps: true
});

module.exports = DeliveryStatusHistory;
