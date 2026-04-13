const mongoose = require('mongoose');
const Book = require('./backend/models/Book');

mongoose.connect('mongodb://127.0.0.1:27017/bookcycle').then(async () => {
    try {
        console.log("Connected");
        const books = await Book.find({ category: { $in: [/^Science$/i, /^Programming$/i] } });
        console.log('Books in Science or Programming using regex query:', books.length);
        
        const books2 = await Book.find({ category: { $in: ['Science', 'Programming'] } });
        console.log('Books in Science or Programming using string query:', books2.length);

        process.exit(0);
    } catch(e) {
        console.error(e);
        process.exit(1);
    }
});
