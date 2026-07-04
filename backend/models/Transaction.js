const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../db/connectPostgres');

class Transaction extends Model {
  toJSON() {
    const values = { ...this.get() };
    values._id = values.id;
    return values;
  }
}

Transaction.init({
  id: {
    type: DataTypes.STRING(24),
    primaryKey: true,
    allowNull: false,
    defaultValue: () => require('crypto').randomBytes(12).toString('hex')
  },
  book: {
    type: DataTypes.STRING(24),
    allowNull: false
  },
  requester: {
    type: DataTypes.STRING(24),
    allowNull: false
  },
  owner: {
    type: DataTypes.STRING(24),
    allowNull: false
  },
  exchangeType: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: {
        args: [['Buy', 'Rent', 'Borrow']],
        msg: "Exchange type is not supported"
      }
    }
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'Pending',
    validate: {
      isIn: {
        args: [['Pending', 'Accepted', 'Rejected', 'Completed']],
        msg: "Status is not supported"
      }
    }
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Transaction',
  tableName: 'transactions',
  timestamps: true
});

module.exports = Transaction;
