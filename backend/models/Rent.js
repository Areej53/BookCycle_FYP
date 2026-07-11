const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../db/connectPostgres');

class Rent extends Model {
  toJSON() {
    const values = { ...this.get() };
    values._id = values.id;
    return values;
  }
}

Rent.init({
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false
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
  rentalDuration: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  rentPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'Available',
    validate: {
      isIn: {
        args: [['Available', 'Reserved', 'Rented', 'Returned']],
        msg: "Please provide valid status"
      }
    }
  },
  rentalStartDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  rentalEndDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Rent',
  tableName: 'rents',
  timestamps: true
});

module.exports = Rent;
