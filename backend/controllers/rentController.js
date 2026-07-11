const { Rent, Book, User, Notification, Order } = require('../models');
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

const createRentBook = async (req, res) => {
  const { title, author, description, condition, category, rentPrice, rentalDuration } = req.body;
  
  if (!title || !author || !description || !condition || !category || !rentPrice || !rentalDuration) {
    return res.status(400).json({ msg: "Please provide all required fields (title, author, description, condition, category, rentPrice, rentalDuration)." });
  }

  const numericPrice = Number(rentPrice);
  if (isNaN(numericPrice) || numericPrice <= 0) {
    return res.status(400).json({ msg: "Rent price must be a numeric value greater than zero." });
  }

  const validDurations = ['3 Months', '6 Months', '1 Year'];
  if (!validDurations.includes(rentalDuration)) {
    return res.status(400).json({ msg: "Invalid rental duration. Allowed: '3 Months', '6 Months', '1 Year'." });
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
    exchangeType: 'Rent',
    price: numericPrice,
    rentWeek: numericPrice, // for backward compatibility with components using rentWeek
    images,
    image,
    duration: rentalDuration,
    status: 'Available',
    ownerId: req.user.id
  });

  // Create Rent record
  const rent = await Rent.create({
    bookId: book.id,
    rentalDuration,
    rentPrice: numericPrice,
    status: 'Available'
  });

  // Notify seller
  await Notification.create({
    userId: req.user.id,
    message: `Rental listing "${book.title}" has been successfully added.`,
    type: "general"
  });

  res.status(201).json({ rent, book });
};

const getAllRentBooks = async (req, res) => {
  const { sellerId } = req.query;
  
  const query = {};
  if (sellerId) {
    query['$book.ownerId$'] = sellerId;
  }

  const rents = await Rent.findAll({
    where: query,
    include: [{
      model: Book,
      as: 'book',
      include: [{ model: User, as: 'owner', attributes: ['name', 'email'] }]
    }]
  });

  res.status(200).json({ rents, count: rents.length });
};

const getRentBookById = async (req, res) => {
  const { id } = req.params;
  
  const rent = await Rent.findOne({
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

  if (!rent) {
    return res.status(404).json({ msg: `No rent listing found with id ${id}` });
  }

  res.status(200).json({ rent });
};

const updateRentBook = async (req, res) => {
  const { id } = req.params;
  
  const rent = await Rent.findOne({
    where: {
      [Op.or]: [
        { id },
        { bookId: id }
      ]
    },
    include: [{ model: Book, as: 'book' }]
  });

  if (!rent) {
    return res.status(404).json({ msg: `No rent listing found with id ${id}` });
  }

  if (rent.book.ownerId !== req.user.id) {
    return res.status(403).json({ msg: "You are not authorized to update this listing." });
  }

  const { rentPrice, rentalDuration, status } = req.body;

  if (rentPrice !== undefined) {
    const numericPrice = Number(rentPrice);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ msg: "Rent price must be a numeric value greater than zero." });
    }
    rent.rentPrice = numericPrice;
    await rent.book.update({ price: numericPrice, rentWeek: numericPrice });
  }

  if (rentalDuration !== undefined) {
    const validDurations = ['3 Months', '6 Months', '1 Year'];
    if (!validDurations.includes(rentalDuration)) {
      return res.status(400).json({ msg: "Invalid rental duration. Allowed: '3 Months', '6 Months', '1 Year'." });
    }
    rent.rentalDuration = rentalDuration;
    await rent.book.update({ duration: rentalDuration });
  }

  if (status !== undefined) {
    const validStatuses = ['Available', 'Reserved', 'Rented', 'Returned'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ msg: "Invalid rent status." });
    }
    
    rent.status = status;

    if (status === 'Returned') {
      rent.rentalStartDate = null;
      rent.rentalEndDate = null;
      await rent.book.update({ status: 'Available' });

      // Notify seller
      await Notification.create({
        userId: req.user.id,
        message: `Rented book "${rent.book.title}" has been marked as returned.`,
        type: "general"
      });

      // Notify the latest buyer if possible
      try {
        const latestOrder = await Order.findOne({
          where: { orderType: 'RENT' },
          include: [{ model: Book, as: 'bookDetails', where: { id: rent.bookId } }],
          order: [['createdAt', 'DESC']]
        });
        if (latestOrder) {
          await Notification.create({
            userId: latestOrder.buyerId,
            message: `Your rented book "${rent.book.title}" has been marked as returned. Thank you!`,
            type: "general"
          });
        }
      } catch (err) {
        console.error("Failed to fetch latest order for return notification", err);
      }
    } else if (status === 'Available') {
      await rent.book.update({ status: 'Available' });
    } else {
      await rent.book.update({ status: 'Unavailable' });
    }
  }

  await rent.save();

  // Return fresh object
  const updatedRent = await Rent.findByPk(rent.id, {
    include: [{ model: Book, as: 'book', include: [{ model: User, as: 'owner', attributes: ['name', 'email'] }] }]
  });

  res.status(200).json({ rent: updatedRent });
};

const deleteRentBook = async (req, res) => {
  const { id } = req.params;
  
  const rent = await Rent.findOne({
    where: {
      [Op.or]: [
        { id },
        { bookId: id }
      ]
    },
    include: [{ model: Book, as: 'book' }]
  });

  if (!rent) {
    return res.status(404).json({ msg: `No rent listing found with id ${id}` });
  }

  if (rent.book.ownerId !== req.user.id) {
    return res.status(403).json({ msg: "You are not authorized to delete this listing." });
  }

  // Deleting the main book will trigger a cascade delete on rents table
  const bookTitle = rent.book.title;
  await rent.book.destroy();

  await Notification.create({
    userId: req.user.id,
    message: `Rental listing "${bookTitle}" has been removed.`,
    type: "general"
  });

  res.status(200).json({ msg: "Rent listing deleted successfully." });
};

module.exports = {
  createRentBook,
  getAllRentBooks,
  getRentBookById,
  updateRentBook,
  deleteRentBook
};
