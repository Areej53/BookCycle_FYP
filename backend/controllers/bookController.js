const Book = require('../models/Book');

const getAllBooks = async (req, res) => {
  const { category, search, type } = req.query;
  const queryObject = { status: 'Available' };

  if (category) queryObject.category = category;
  if (type) queryObject.exchangeType = type;
  if (search) queryObject.title = { $regex: search, $options: 'i' };

  const books = await Book.find(queryObject).populate('owner', 'name');
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
