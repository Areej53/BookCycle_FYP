require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Book = require('./models/Book');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log("----- USERS -----");
  const users = await User.find({}).lean();
  for (const u of users) {
     if (u.name && u.name.toLowerCase().includes('moon')) {
        console.log(`User ${u.name} (${u.email}): interests=`, u.interests);
     }
  }

  console.log("----- BOOKS BY CATEGORY -----");
  const books = await Book.find({ status: 'Available' }).populate('owner', 'name email').lean();
  const counts = {};
  for (const b of books) {
    if (!counts[b.category]) counts[b.category] = 0;
    counts[b.category]++;
  }
  console.log(counts);

  process.exit(0);
}).catch(console.error);
