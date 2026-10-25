const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../db/connectPostgres');

class PaymentAuditLog extends Model {
  toJSON() {
    const values = { ...this.get() };
    values._id = values.id;
    return values;
  }
}

PaymentAuditLog.init({
  id: {
    type: DataTypes.STRING(24),
    primaryKey: true,
    allowNull: false,
    defaultValue: () => require('crypto').randomBytes(12).toString('hex')
  },
  orderId: {
    type: DataTypes.STRING(24),
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  action: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  performedBy: {
    type: DataTypes.STRING(24),
    allowNull: true
  },
  performedByRole: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  previousPaymentStatus: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  newPaymentStatus: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  sequelize,
  modelName: 'PaymentAuditLog',
  tableName: 'payment_audit_logs',
  timestamps: true
});

module.exports = PaymentAuditLog;
