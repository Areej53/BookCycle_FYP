const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../db/connectPostgres');

class Exchange extends Model {
  toJSON() {
    const values = { ...this.get() };
    values._id = values.id;
    return values;
  }
}

Exchange.init({
  id: {
    type: DataTypes.STRING(24),
    primaryKey: true,
    allowNull: false,
    defaultValue: () => require('crypto').randomBytes(12).toString('hex')
  },
  bookId: {
    type: DataTypes.STRING(24),
    allowNull: false,
    unique: true,
    references: {
      model: 'books',
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
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  author: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  condition: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: []
  },
  lookingFor: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  listingType: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'Exchange',
    validate: {
      isIn: {
        args: [['Exchange']],
        msg: "Listing type must be Exchange"
      }
    }
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'Available',
    validate: {
      isIn: {
        args: [['Available', 'Reserved', 'Completed', 'Cancelled']],
        msg: "Please provide valid status"
      }
    }
  }
}, {
  sequelize,
  modelName: 'Exchange',
  tableName: 'exchanges',
  timestamps: true
});

module.exports = Exchange;
