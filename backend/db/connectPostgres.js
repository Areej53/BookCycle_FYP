const { Sequelize } = require('sequelize');

const databaseUrl = process.env.DATABASE_URL || 'postgres://postgres:password@localhost:5432/bookcycleDB';

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false,
  define: {
    timestamps: true,
  }
});

const connectPostgres = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL connected successfully.');
  } catch (error) {
    console.error('PostgreSQL connection failed:', error.message);
    throw error;
  }
};

module.exports = { sequelize, connectPostgres };
