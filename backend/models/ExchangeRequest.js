const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../db/connectPostgres');

class ExchangeRequest extends Model {
  toJSON() {
    const values = { ...this.get() };
    values._id = values.id;
    return values;
  }
}

ExchangeRequest.init({
  id: {
    type: DataTypes.STRING(24),
    primaryKey: true,
    allowNull: false,
    defaultValue: () => require('crypto').randomBytes(12).toString('hex')
  },
  requesterId: {
    type: DataTypes.STRING(24),
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  ownerId: {
    type: DataTypes.STRING(24),
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  requestedBookId: {
    type: DataTypes.STRING(24),
    allowNull: false,
    references: {
      model: 'books',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  offeredBookId: {
    type: DataTypes.STRING(24),
    allowNull: false,
    references: {
      model: 'books',
      key: 'id'
    },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'Pending',
    validate: {
      isIn: {
        args: [['Pending', 'Accepted', 'Rejected', 'Cancelled', 'InDelivery', 'Completed']],
        msg: "Please provide valid status"
      }
    }
  }
}, {
  sequelize,
  modelName: 'ExchangeRequest',
  tableName: 'exchange_requests',
  timestamps: true
});

module.exports = ExchangeRequest;
