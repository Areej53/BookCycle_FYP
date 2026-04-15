require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Book = require('./models/Book');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  const moon = await User.findOne({ email: 'areej5849582@gmail.com' });
  const books = await Book.find({ status: 'Available' });
  let moonCount = 0;
  for (const b of books) {
    if (b.owner.toString() === moon._id.toString()) moonCount++;
  }
  console.log(`Total available books: ${books.length}`);
  console.log(`Books owned by moon: ${moonCount}`);
  
  process.exit(0);
}).catch(console.error);
