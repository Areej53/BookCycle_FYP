const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../db/connectPostgres');

class Book extends Model {
  toJSON() {
    const values = { ...this.get() };
    values._id = values.id;
    return values;
  }
}

Book.init({
  id: {
    type: DataTypes.STRING(24),
    primaryKey: true,
    allowNull: false,
    defaultValue: () => require('crypto').randomBytes(12).toString('hex')
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "Please provide book title"
      }
    }
  },
  author: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "Please provide author name"
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: "Please provide description"
      }
    }
  },
  condition: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: {
        args: [['New', 'Used/Good']],
        msg: "Please provide valid condition"
      }
    }
  },
  category: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'Other',
    validate: {
      isIn: {
        args: [['Programming', 'Science', 'Novels', 'Self Development', 'Algebra', 'Mathematics', 'Physics', 'Notes', 'Other']],
        msg: "Please provide valid category"
      }
    }
  },
  exchangeType: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      isIn: {
        args: [['Sell', 'Rent', 'Exchange']],
        msg: "Please specify exchange type"
      }
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  rentWeek: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  rentMonth: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  securityDeposit: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  },
  images: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: []
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  pdf: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  subject: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  duration: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'Available',
    validate: {
      isIn: {
        args: [['Available', 'Pending', 'Unavailable']],
        msg: "Please provide valid status"
      }
    }
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  ownerId: {
    type: DataTypes.STRING(24),
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'Book',
  tableName: 'books',
  timestamps: true
});

module.exports = Book;
