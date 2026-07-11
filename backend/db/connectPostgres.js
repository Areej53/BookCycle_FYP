const { Sequelize } = require('sequelize');

const databaseUrl = process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/bookcycleDB';

const useSSL = process.env.DB_SSL === 'true' || databaseUrl.includes('supabase.co');

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
    // Check and add orderType column to orders if it does not exist
    await sequelize.query('ALTER TABLE orders ADD COLUMN IF NOT EXISTS "orderType" VARCHAR(20) DEFAULT \'BUY\';');
    console.log('PostgreSQL database column checks passed.');
  } catch (error) {
    console.error('PostgreSQL connection failed:', error.message);
    throw error;
  }
};

module.exports = { sequelize, connectPostgres };
