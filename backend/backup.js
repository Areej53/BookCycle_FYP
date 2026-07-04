require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const User = require('./models/User');
const Book = require('./models/Book');
const Order = require('./models/Order');
const Transaction = require('./models/Transaction');
const Notification = require('./models/Notification');

const backupDir = path.join(__dirname, 'backup');

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

async function runBackup() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected successfully.');

    const models = [
      { name: 'users', model: User },
      { name: 'books', model: Book },
      { name: 'orders', model: Order },
      { name: 'transactions', model: Transaction },
      { name: 'notifications', model: Notification }
    ];

    for (const item of models) {
      console.log(`Backing up ${item.name}...`);
      const data = await item.model.find({}).lean();
      const filePath = path.join(backupDir, `${item.name}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`Saved ${data.length} records to ${filePath}`);
    }

    console.log('Database backup process completed.');
    process.exit(0);
  } catch (error) {
    console.error('Backup process failed:', error);
    process.exit(1);
  }
}

runBackup();
