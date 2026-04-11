const Book = require('../models/Book');

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

module.exports = { getAllBooks, getBook, createBook, updateBook, deleteBook };
