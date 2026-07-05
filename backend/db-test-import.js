const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { Client } = require('pg');
const fs = require('fs');
const { sequelize } = require('./db/connectPostgres');
require('./models'); // Load models and associations

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:Areej123%21%40%23%24%25%5E%26%2A%28%29@db.wvxwidqpqaqnepoktdnn.supabase.co:5432/postgres';

const main = async () => {
  try {
    console.log('Step 1: Synchronizing Sequelize models with Supabase to create tables...');
    await sequelize.sync();
    console.log('✅ Sequelize models synchronized successfully!');

    // Step 2: Restore backup data
    const client = new Client({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      }
    });

    console.log('Step 2: Connecting to Supabase via pg client to restore data...');
    await client.connect();
    console.log('Connected successfully!');

    console.log('Reading local_backup.sql...');
    const sqlPath = path.join(__dirname, 'local_backup.sql');
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`Backup file not found at ${sqlPath}. Make sure local_backup.sql is in the backend folder.`);
    }
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('Cleaning SQL content (filtering psql backslash commands)...');
    const cleanSql = sql
      .split('\n')
      .filter(line => !line.trim().startsWith('\\'))
      .join('\n');

    console.log('Disabling foreign key checks temporarily (setting session_replication_role)...');
    await client.query('SET session_replication_role = replica;');

    console.log('Executing SQL restore queries (this may take a few seconds)...');
    await client.query(cleanSql);

    console.log('Re-enabling foreign key checks (restoring session_replication_role)...');
    await client.query('SET session_replication_role = origin;');

    console.log('🎉 Database schema and data restored successfully!');
    await client.end();
  } catch (err) {
    console.error('❌ Error during import process:', err);
  } finally {
    process.exit(0);
  }
};

main();
