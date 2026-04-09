const Transaction = require('../models/Transaction');
const Book = require('../models/Book');

const createTransaction = async (req, res) => {
  const { bookId, exchangeType, message } = req.body;
  const book = await Book.findById(bookId);
  if (!book) return res.status(404).json({ msg: "Book not found" });

  const transaction = await Transaction.create({
    book: bookId,
    requester: req.user.id,
    owner: book.owner,
    exchangeType,
    message
  });

  res.status(201).json({ transaction });
};

const getMyRequests = async (req, res) => {
  const incoming = await Transaction.find({ owner: req.user.id }).populate('book', 'title').populate('requester', 'name');
  const outgoing = await Transaction.find({ requester: req.user.id }).populate('book', 'title').populate('owner', 'name');
  
  res.status(200).json({ incoming, outgoing });
};

const updateTransactionStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const transaction = await Transaction.findOneAndUpdate(
    { _id: id, owner: req.user.id },
    { status },
    { new: true, runValidators: true }
  );
  
  if (!transaction) return res.status(404).json({ msg: "Transaction not found" });
  
  if (status === 'Accepted') {
     await Book.findByIdAndUpdate(transaction.book, { status: 'Pending' });
  } else if (status === 'Completed') {
     await Book.findByIdAndUpdate(transaction.book, { status: 'Unavailable' });
  }

  res.status(200).json({ transaction });
};

module.exports = { createTransaction, getMyRequests, updateTransactionStatus };
