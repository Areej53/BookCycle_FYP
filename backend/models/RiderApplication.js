const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../db/connectPostgres');

class RiderApplication extends Model {
  toJSON() {
    const values = { ...this.get() };
    values._id = values.id;
    return values;
  }
}

RiderApplication.init({
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
  fullName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  cnic: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  city: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  profileImage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  vehicleType: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  vehicleNumber: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  drivingLicenseNumber: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  drivingLicenseImage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'PENDING',
    validate: {
      isIn: {
        args: [['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']],
        msg: "Invalid status"
      }
    }
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null
  },
  submittedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  reviewedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  reviewedBy: {
    type: DataTypes.STRING(24),
    allowNull: true
  },
  isRiderActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  sequelize,
  modelName: 'RiderApplication',
  tableName: 'rider_applications',
  timestamps: true
});

module.exports = RiderApplication;
