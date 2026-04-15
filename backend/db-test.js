require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  const users = await User.find({}).lean();
  console.log('Total users:', users.length);
  for (const u of users) {
     console.log(`User ${u.email}: interests=`, u.interests, ' viewedBooks=', u.viewedBooks);
  }
  process.exit(0);
}).catch(console.error);
