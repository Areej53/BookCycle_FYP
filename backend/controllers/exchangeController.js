const { Exchange, Book, User, Notification } = require('../models');
const { Op } = require('sequelize');
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

const createExchangeBook = async (req, res) => {
  const { title, author, description, condition, category, lookingFor } = req.body;
  
  if (!title || !author || !description || !condition || !category) {
    return res.status(400).json({ msg: "Please provide all required fields (title, author, description, condition, category)." });
  }

  req.body.ownerId = req.user.id;
  
  let image = '';
  let images = [];

  if (req.body.image) {
    image = saveBase64Image(req.body.image);
  }
  if (req.body.images && Array.isArray(req.body.images)) {
    images = req.body.images.map(img => saveBase64Image(img));
  }
  if (!image && images.length > 0) {
    image = images[0];
  }

  // Create Book record
  const book = await Book.create({
    title,
    author,
    description,
    condition,
    category,
    exchangeType: 'Exchange',
    price: 0,
    images,
    image,
    status: 'Available',
    ownerId: req.user.id
  });

  // Create Exchange record
  const exchange = await Exchange.create({
    bookId: book.id,
    ownerId: req.user.id,
    title,
    author,
    category,
    condition,
    description,
    images,
    lookingFor: lookingFor || null,
    listingType: 'Exchange',
    status: 'Available'
  });

  // Notify seller
  await Notification.create({
    userId: req.user.id,
    message: `Exchange listing "${book.title}" has been successfully added.`,
    type: "general"
  });

  res.status(201).json({ exchange, book });
};

const getAllExchangeBooks = async (req, res) => {
  const { sellerId } = req.query;
  
  const query = {};
  if (sellerId) {
    query['$book.ownerId$'] = sellerId;
  }

  const exchanges = await Exchange.findAll({
    where: query,
    include: [{
      model: Book,
      as: 'book',
      include: [{ model: User, as: 'owner', attributes: ['name', 'email'] }]
    }]
  });

  res.status(200).json({ exchanges, count: exchanges.length });
};

const getExchangeBookById = async (req, res) => {
  const { id } = req.params;
  
  const exchange = await Exchange.findOne({
    where: {
      [Op.or]: [
        { id },
        { bookId: id }
      ]
    },
    include: [{
      model: Book,
      as: 'book',
      include: [{ model: User, as: 'owner', attributes: ['name', 'email'] }]
    }]
  });

  if (!exchange) {
    return res.status(404).json({ msg: `No exchange listing found with id ${id}` });
  }

  res.status(200).json({ exchange });
};

const updateExchangeBook = async (req, res) => {
  const { id } = req.params;
  
  const exchange = await Exchange.findOne({
    where: {
      [Op.or]: [
        { id },
        { bookId: id }
      ]
    },
    include: [{ model: Book, as: 'book' }]
  });

  if (!exchange) {
    return res.status(404).json({ msg: `No exchange listing found with id ${id}` });
  }

  if (exchange.book.ownerId !== req.user.id) {
    return res.status(403).json({ msg: "You are not authorized to update this listing." });
  }

  const { lookingFor, status } = req.body;

  if (lookingFor !== undefined) {
    exchange.lookingFor = lookingFor;
  }

  if (status !== undefined) {
    const validStatuses = ['Available', 'Reserved', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: "Invalid exchange status." });
    }
    
    exchange.status = status;

    if (status === 'Available') {
      await exchange.book.update({ status: 'Available' });
    } else if (status === 'Reserved') {
      await exchange.book.update({ status: 'Unavailable' });
    } else if (status === 'Completed' || status === 'Cancelled') {
      await exchange.book.update({ status: 'Unavailable' });
    }
  }

  await exchange.save();

  // Return fresh object
  const updatedExchange = await Exchange.findByPk(exchange.id, {
    include: [{ model: Book, as: 'book', include: [{ model: User, as: 'owner', attributes: ['name', 'email'] }] }]
  });

  res.status(200).json({ exchange: updatedExchange });
};

const deleteExchangeBook = async (req, res) => {
  const { id } = req.params;
  
  const exchange = await Exchange.findOne({
    where: {
      [Op.or]: [
        { id },
        { bookId: id }
      ]
    },
    include: [{ model: Book, as: 'book' }]
  });

  if (!exchange) {
    return res.status(404).json({ msg: `No exchange listing found with id ${id}` });
  }

  if (exchange.book.ownerId !== req.user.id) {
    return res.status(403).json({ msg: "You are not authorized to delete this listing." });
  }

  // Deleting the main book will trigger a cascade delete on exchanges table
  const bookTitle = exchange.book.title;
  await exchange.book.destroy();

  await Notification.create({
    userId: req.user.id,
    message: `Exchange listing "${bookTitle}" has been removed.`,
    type: "general"
  });

  res.status(200).json({ msg: "Exchange listing deleted successfully." });
};

module.exports = {
  createExchangeBook,
  getAllExchangeBooks,
  getExchangeBookById,
  updateExchangeBook,
  deleteExchangeBook
};
