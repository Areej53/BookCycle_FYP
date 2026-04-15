require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('./models/Book');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('Migrating database conditions...');
  
  // Update 'Like New' to 'New' (we don't need to update 'New' since it's already 'New')
  const res1 = await Book.updateMany(
    { condition: 'Like New' }, 
    { $set: { condition: 'New' } }
  );
  console.log(`Updated 'Like New' to 'New': ${res1.modifiedCount || 0} books migrated.`);

  // Update 'Good', 'Fair', 'Poor' to 'Used/Good'
  const res2 = await Book.updateMany(
    { condition: { $in: ['Good', 'Fair', 'Poor', 'Used'] } }, 
    { $set: { condition: 'Used/Good' } }
  );
  console.log(`Updated 'Good', 'Fair', 'Poor' to 'Used/Good': ${res2.modifiedCount || 0} books migrated.`);

  console.log('Migration complete.');
  process.exit(0);
}).catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
