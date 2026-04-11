const Book = require('../models/Book');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

const saveBase64Image = (base64String) => {
  if (!base64String || !base64String.startsWith('data:image')) return base64String;
  const matches = base64String.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) return base64String;

  const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
  const data = matches[2];
  const buffer = Buffer.from(data, 'base64');
  const filename = `book-${Date.now()}-${Math.floor(Math.random() * 1000)}.${ext}`;
  const filepath = path.join(__dirname, '../uploads', filename);

  fs.writeFileSync(filepath, buffer);
  return `/uploads/${filename}`;
};

const getAllBooks = async (req, res) => {
  const { category, cats, search, q, type, conds, condition, price, sort } = req.query;
  const queryObject = { status: 'Available' };

  const finalCategory = category || cats;
  const finalSearch = search || q;
  const finalCondition = condition || conds;

  if (finalCategory) {
    const categoryList = finalCategory.split(',').map(c => new RegExp(`^${c}$`, 'i'));
    queryObject.category = { $in: categoryList };
  }
  if (type) {
    queryObject.exchangeType = { $regex: new RegExp(`^${type}$`, 'i') };
  }
  if (finalSearch) {
    queryObject.title = { $regex: finalSearch, $options: 'i' };
  }
  if (finalCondition) {
    const condArray = finalCondition.split(',').map(c => new RegExp(c, 'i'));
    queryObject.condition = { $in: condArray };
  }
  if (price) {
    queryObject.price = { $lte: Number(price) };
  }

  let result = Book.find(queryObject).populate('owner', 'name');

  // Sorting
  if (sort === 'price-asc') {
    result = result.sort('price');
  } else if (sort === 'price-desc') {
    result = result.sort('-price');
  } else if (sort === 'recent' || !sort) {
    result = result.sort('-createdAt');
  }

  const books = await result;
  res.status(200).json({ books, count: books.length });
};

const getBook = async (req, res) => {
  const { id } = req.params;
  const book = await Book.findById(id).populate('owner', 'name email');
  if (!book) return res.status(404).json({ msg: `No book with id ${id}` });
  res.status(200).json({ book });
};

const createBook = async (req, res) => {
  req.body.owner = req.user.id;
  
  if (req.body.image) {
    req.body.image = saveBase64Image(req.body.image);
  }
  if (req.body.images && Array.isArray(req.body.images)) {
    req.body.images = req.body.images.map(img => saveBase64Image(img));
  }

  const book = await Book.create(req.body);
  res.status(201).json({ book });
};

const updateBook = async (req, res) => {
  const { id } = req.params;
  const book = await Book.findOneAndUpdate(
    { _id: id, owner: req.user.id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!book) return res.status(404).json({ msg: `No book with id ${id} found for user` });
  res.status(200).json({ book });
};

const deleteBook = async (req, res) => {
  const { id } = req.params;
  const book = await Book.findOneAndDelete({ _id: id, owner: req.user.id });
  if (!book) return res.status(404).json({ msg: `No book with id ${id} found for user` });
  res.status(200).json({ msg: "Book deleted" });
};

const getRecommendedBooks = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.interests || user.interests.length === 0) {
      return res.status(200).json({ books: [] });
    }

    const promises = user.interests.map(interest => 
      Book.find({ category: new RegExp(`^${interest}$`, 'i'), status: 'Available' })
        .sort('-createdAt')
        .limit(5)
        .populate('owner', 'name')
    );

    const results = await Promise.all(promises);
    let books = results.flat();
    
    // Remove duplicates
    const uniqueIds = new Set();
    books = books.filter(b => {
      const isDuplicate = uniqueIds.has(b._id.toString());
      uniqueIds.add(b._id.toString());
      return !isDuplicate;
    });

    books.sort((a,b) => b.createdAt - a.createdAt);

    res.status(200).json({ books });
  } catch (error) {
    res.status(500).json({ msg: "Error fetching recommendations", error: error.message });
  }
};

module.exports = { getAllBooks, getBook, createBook, updateBook, deleteBook, getRecommendedBooks };
