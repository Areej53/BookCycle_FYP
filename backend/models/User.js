const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../db/connectPostgres');
const bcrypt = require('bcryptjs');

class User extends Model {
  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  }
  toJSON() {
    const values = { ...this.get() };
    values._id = values.id;
    return values;
  }
}

User.init({
  id: {
    type: DataTypes.STRING(24),
    primaryKey: true,
    allowNull: false,
    defaultValue: () => require('crypto').randomBytes(12).toString('hex')
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      len: {
        args: [3, 50],
        msg: "Please provide name between 3 and 50 characters"
      }
    }
  },
  email: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: {
      msg: "Email already in use"
    },
    validate: {
      isEmail: {
        msg: "Please provide a valid email"
      }
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  role: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: {
        args: [['customer', 'shopkeeper']],
        msg: "Role is not supported"
      }
    }
  },
  interests: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    validate: {
      notEmptyArray(value) {
        if (!value || value.length === 0) {
          throw new Error('Please select at least one interest');
        }
      }
    }
  },
  finance_totalEarnings: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  finance_monthlyEarnings: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  finance_completedOrdersRevenue: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00
  },
  isBlocked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  complaintCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  reviewsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  ratingsSum: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  hooks: {
    beforeSave: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

module.exports = User;
