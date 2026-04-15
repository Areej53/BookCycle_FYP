require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Book = require('./models/Book');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  const user = await User.findOne({ email: 'sara@gmail.com' });
  console.log('Sara interests:', user.interests);
  const interests = user.interests || [];
  
  const viewingBehavior = user.viewedBooks || [];
  viewingBehavior.sort((a,b) => b.views - a.views);
  const viewedCategories = viewingBehavior.map(vb => vb.category).filter(Boolean);
  
  const combinedCategories = [...new Set([...interests, ...viewedCategories])];
  console.log('Combined:', combinedCategories);
  
  const rules = combinedCategories.map(c => new RegExp(`^${c}$`, 'i'));
  const booksRaw = await Book.find({
      category: { $in: combinedCategories },
      status: 'Available'
  }).sort('-createdAt').limit(50).populate('owner', 'name');
  
  console.log('Books found exactly:', booksRaw.length);

  const booksRawRegex = await Book.find({
      category: { $in: rules },
      status: 'Available'
  }).sort('-createdAt').limit(50).populate('owner', 'name');
  console.log('Books found regex:', booksRawRegex.length);

  process.exit(0);
}).catch(console.error);
