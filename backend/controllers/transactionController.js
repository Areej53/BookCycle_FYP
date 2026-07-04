const { Transaction, Book, User } = require('../models');

const createTransaction = async (req, res) => {
  const { bookId, exchangeType, message } = req.body;
  const book = await Book.findByPk(bookId);
  if (!book) return res.status(404).json({ msg: "Book not found" });

  const transaction = await Transaction.create({
    book: bookId,
    requester: req.user.id,
    owner: book.ownerId,
    exchangeType,
    message
  });

  res.status(201).json({ transaction });
};

const getMyRequests = async (req, res) => {
  const incoming = await Transaction.findAll({
    where: { owner: req.user.id },
    include: [
      { model: Book, as: 'bookDetails', attributes: ['title'] },
      { model: User, as: 'requesterUser', attributes: ['name'] }
    ]
  });

  const outgoing = await Transaction.findAll({
    where: { requester: req.user.id },
    include: [
      { model: Book, as: 'bookDetails', attributes: ['title'] },
      { model: User, as: 'ownerUser', attributes: ['name'] }
    ]
  });

  // Map Sequelize relations to MongoDB-style populated properties for frontend compatibility
  const formattedIncoming = incoming.map(t => {
    const json = t.toJSON();
    if (json.bookDetails) json.book = json.bookDetails;
    if (json.requesterUser) json.requester = json.requesterUser;
    return json;
  });

  const formattedOutgoing = outgoing.map(t => {
    const json = t.toJSON();
    if (json.bookDetails) json.book = json.bookDetails;
    if (json.ownerUser) json.owner = json.ownerUser;
    return json;
  });
  
  res.status(200).json({ incoming: formattedIncoming, outgoing: formattedOutgoing });
};

const updateTransactionStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const transaction = await Transaction.findOne({
    where: { id, owner: req.user.id }
  });
  
  if (!transaction) return res.status(404).json({ msg: "Transaction not found" });
  
  await transaction.update({ status });
  
  if (status === 'Accepted') {
    const book = await Book.findByPk(transaction.book);
    if (book) {
      await book.update({ status: 'Pending' });
    }
  } else if (status === 'Completed') {
    const book = await Book.findByPk(transaction.book);
    if (book) {
      await book.update({ status: 'Unavailable' });
    }
  }

  res.status(200).json({ transaction });
};

module.exports = { createTransaction, getMyRequests, updateTransactionStatus };
