const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../db/connectPostgres');

class Order extends Model {
  toJSON() {
    const values = { ...this.get() };
    values._id = values.id;
    values.orderNumber = values.id && values.id.startsWith('BC-')
      ? values.id
      : `BC-${(values.id || '').slice(-6).toUpperCase()}`;
    return values;
  }
}

Order.init({
  id: {
    type: DataTypes.STRING(24),
    primaryKey: true,
    allowNull: false,
    defaultValue: () => `BC-${Math.floor(100000 + Math.random() * 900000)}`
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
  orderType: {
    type: DataTypes.STRING(20),
    defaultValue: 'BUY',
    validate: {
      isIn: {
        args: [['BUY', 'RENT', 'EXCHANGE']],
        msg: "Order type is not supported"
      }
    }
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
          "in_delivery",
          "InDelivery",
          "delivered",
          "payment_submitted",
          "completed",
          "cancelled",
          "complain",
          "rental_active"
        ]],
        msg: "Status is not supported"
      }
    }
  },
  complainReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  riderId: {
    type: DataTypes.STRING(24),
    allowNull: true
  },
  deliveryStatus: {
    type: DataTypes.STRING(30),
    defaultValue: 'UNASSIGNED'
  },
  paymentMethod: {
    type: DataTypes.STRING(30),
    defaultValue: 'COD'
  },
  paymentStatus: {
    type: DataTypes.STRING(30),
    defaultValue: 'COD_PENDING',
    validate: {
      isIn: {
        args: [[
          'COD_PENDING',
          'COD_COLLECTED',
          'DEPOSIT_PENDING',
          'DEPOSITED',
          'PARTIALLY_REFUNDED',
          'REFUNDED',
          'SETTLED'
        ]],
        msg: "Invalid payment status"
      }
    }
  },
  codAmountDue: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  codAmountCollected: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  codCollectedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  codCollectedBy: {
    type: DataTypes.STRING(24),
    allowNull: true
  },
  depositStatus: {
    type: DataTypes.STRING(30),
    defaultValue: 'PENDING'
  },
  depositAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  depositedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  depositedBy: {
    type: DataTypes.STRING(24),
    allowNull: true
  },
  hasDiscrepancy: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  discrepancyReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  discrepancyResolved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  sellerPayableAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  sellerPayoutStatus: {
    type: DataTypes.STRING(30),
    defaultValue: 'PENDING'
  },
  sellerPaidAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  riderEarningAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  riderPayoutStatus: {
    type: DataTypes.STRING(30),
    defaultValue: 'PENDING'
  },
  riderPaidAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  platformCommission: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  securityDeposit: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  securityDepositStatus: {
    type: DataTypes.STRING(30),
    defaultValue: 'NONE'
  },
  refundAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  refundedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  refundReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reconciliationNotes: {
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
