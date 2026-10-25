const { Sequelize } = require('sequelize');

const databaseUrl = process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/bookcycleDB';

const useSSL = process.env.DB_SSL === 'true' || databaseUrl.includes('supabase.co') || databaseUrl.includes('supabase.com');

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: useSSL ? {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  } : {},
  define: {
    timestamps: true,
  }
});

const connectPostgres = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connected successfully.');
    // Check and add columns if they do not exist
    await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS "orderType" VARCHAR(20) DEFAULT \'BUY\';');
    await sequelize.query('ALTER TABLE rider_applications ADD COLUMN IF NOT EXISTS "isRiderActive" BOOLEAN DEFAULT true;');
    await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS "riderId" VARCHAR(24);');
    await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS "deliveryStatus" VARCHAR(30) DEFAULT \'UNASSIGNED\';');
    await sequelize.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS "address" TEXT;');
    await sequelize.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS "city" VARCHAR(50);');

    // COD Payment System columns
    await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS "paymentMethod" VARCHAR(30) DEFAULT \'COD\';');
    await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS "paymentStatus" VARCHAR(30) DEFAULT \'COD_PENDING\';');
    await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS "codAmountDue" DECIMAL(10, 2) DEFAULT 0.00;');
    await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS "codAmountCollected" DECIMAL(10, 2) DEFAULT 0.00;');
    await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS "codCollectedAt" TIMESTAMP WITH TIME ZONE;');
    await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS "codCollectedBy" VARCHAR(24);');
    await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS "depositStatus" VARCHAR(30) DEFAULT \'PENDING\';');
    await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS "depositAmount" DECIMAL(10, 2) DEFAULT 0.00;');
    await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS "depositedAt" TIMESTAMP WITH TIME ZONE;');
    await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS "depositedBy" VARCHAR(24);');
    await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS "hasDiscrepancy" BOOLEAN DEFAULT false;');
    await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS "discrepancyReason" TEXT;');
    await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS "discrepancyResolved" BOOLEAN DEFAULT false;');
    await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS "sellerPayableAmount" DECIMAL(10, 2) DEFAULT 0.00;');
    await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS "sellerPayoutStatus" VARCHAR(30) DEFAULT \'PENDING\';');
    await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS "sellerPaidAt" TIMESTAMP WITH TIME ZONE;');
    await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS "riderEarningAmount" DECIMAL(10, 2) DEFAULT 0.00;');
    await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS "riderPayoutStatus" VARCHAR(30) DEFAULT \'PENDING\';');
    await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS "riderPaidAt" TIMESTAMP WITH TIME ZONE;');
    await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS "platformCommission" DECIMAL(10, 2) DEFAULT 0.00;');
    await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS "securityDeposit" DECIMAL(10, 2) DEFAULT 0.00;');
    await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS "securityDepositStatus" VARCHAR(30) DEFAULT \'NONE\';');
    await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS "refundAmount" DECIMAL(10, 2) DEFAULT 0.00;');
    await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS "refundedAt" TIMESTAMP WITH TIME ZONE;');
    await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS "refundReason" TEXT;');
    await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS "reconciliationNotes" TEXT;');

    // Create payment_audit_logs table if it does not exist
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS payment_audit_logs (
        id VARCHAR(24) PRIMARY KEY,
        "orderId" VARCHAR(24) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        action VARCHAR(50) NOT NULL,
        amount DECIMAL(10, 2) DEFAULT 0.00,
        "performedBy" VARCHAR(24),
        "performedByRole" VARCHAR(30),
        "previousPaymentStatus" VARCHAR(30),
        "newPaymentStatus" VARCHAR(30),
        note TEXT,
        metadata JSONB DEFAULT '{}',
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

    console.log('PostgreSQL database column checks and COD payment schema passed.');
  } catch (error) {
    console.error('PostgreSQL connection failed:', error.message);
    throw error;
  }
};

module.exports = { sequelize, connectPostgres };
