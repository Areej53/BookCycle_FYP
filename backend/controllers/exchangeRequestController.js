const { ExchangeRequest, Book, User, Exchange, Notification, Order } = require('../models');
const { Op } = require('sequelize');

const createExchangeRequest = async (req, res) => {
  const { requestedBookId, offeredBookId } = req.body;
  
  if (!requestedBookId || !offeredBookId) {
    return res.status(400).json({ msg: "Please provide both requestedBookId and offeredBookId." });
  }

  // Verify user owns the offered book and it's an Exchange listing
  const offeredBook = await Book.findOne({
    where: { id: offeredBookId, ownerId: req.user.id, exchangeType: 'Exchange' },
    include: [{ model: Exchange, as: 'exchangeDetails' }]
  });

  if (!offeredBook || !offeredBook.exchangeDetails) {
    return res.status(400).json({ msg: "You must own an Exchange book to request an exchange." });
  }

  if (offeredBook.exchangeDetails.status !== 'Available') {
    return res.status(400).json({ msg: "Your offered book is not available for exchange." });
  }

  // Verify the requested book exists and is an Exchange listing
  const requestedBook = await Book.findOne({
    where: { id: requestedBookId, exchangeType: 'Exchange' },
    include: [{ model: Exchange, as: 'exchangeDetails' }]
  });

  if (!requestedBook || !requestedBook.exchangeDetails) {
    return res.status(404).json({ msg: "Requested book not found or not an Exchange listing." });
  }

  if (requestedBook.ownerId === req.user.id) {
    return res.status(400).json({ msg: "You cannot request your own book." });
  }

  if (requestedBook.exchangeDetails.status !== 'Available') {
    return res.status(400).json({ msg: "Requested book is not available for exchange." });
  }

  // Check if request already exists
  const existingRequest = await ExchangeRequest.findOne({
    where: {
      requesterId: req.user.id,
      requestedBookId,
      status: { [Op.in]: ['Pending', 'Accepted'] }
    }
  });

  if (existingRequest) {
    return res.status(400).json({ msg: "You already have a pending or accepted request for this book." });
  }

  // Create exchange request
  const exchangeRequest = await ExchangeRequest.create({
    requesterId: req.user.id,
    ownerId: requestedBook.ownerId,
    requestedBookId,
    offeredBookId,
    status: 'Pending'
  });

  // Notify owner
  await Notification.create({
    userId: requestedBook.ownerId,
    message: `You have received a new exchange request for "${requestedBook.title}".`,
    type: "general"
  });

  // Notify requester
  await Notification.create({
    userId: req.user.id,
    message: `Your exchange request for "${requestedBook.title}" has been sent.`,
    type: "general"
  });

  res.status(201).json({ exchangeRequest });
};

const getExchangeRequests = async (req, res) => {
  const { type } = req.query; // 'sent' or 'received'
  
  let whereClause = {};
  if (type === 'sent') {
    whereClause.requesterId = req.user.id;
  } else if (type === 'received') {
    whereClause.ownerId = req.user.id;
  } else {
    return res.status(400).json({ msg: "Please specify type as 'sent' or 'received'." });
  }

  const requests = await ExchangeRequest.findAll({
    where: whereClause,
    include: [
      { model: User, as: 'requester', attributes: ['name', 'email'] },
      { model: User, as: 'owner', attributes: ['name', 'email'] },
      { model: Book, as: 'requestedBook', include: [{ model: Exchange, as: 'exchangeDetails' }] },
      { model: Book, as: 'offeredBook', include: [{ model: Exchange, as: 'exchangeDetails' }] }
    ],
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json({ requests, count: requests.length });
};

const getExchangeRequestById = async (req, res) => {
  const { id } = req.params;
  
  const request = await ExchangeRequest.findByPk(id, {
    include: [
      { model: User, as: 'requester', attributes: ['name', 'email'] },
      { model: User, as: 'owner', attributes: ['name', 'email'] },
      { model: Book, as: 'requestedBook', include: [{ model: Exchange, as: 'exchangeDetails' }] },
      { model: Book, as: 'offeredBook', include: [{ model: Exchange, as: 'exchangeDetails' }] }
    ]
  });

  if (!request) {
    return res.status(404).json({ msg: `No exchange request found with id ${id}` });
  }

  // Check authorization
  if (request.requesterId !== req.user.id && request.ownerId !== req.user.id) {
    return res.status(403).json({ msg: "You are not authorized to view this request." });
  }

  res.status(200).json({ request });
};

const acceptExchangeRequest = async (req, res) => {
  const { id } = req.params;
  
  const request = await ExchangeRequest.findByPk(id, {
    include: [
      { model: Book, as: 'requestedBook', include: [{ model: Exchange, as: 'exchangeDetails' }] },
      { model: Book, as: 'offeredBook', include: [{ model: Exchange, as: 'exchangeDetails' }] }
    ]
  });

  if (!request) {
    return res.status(404).json({ msg: `No exchange request found with id ${id}` });
  }

  if (request.ownerId !== req.user.id) {
    return res.status(403).json({ msg: "You are not authorized to accept this request." });
  }

  if (request.status !== 'Pending') {
    return res.status(400).json({ msg: "This request cannot be accepted." });
  }

  // Update request status
  request.status = 'Accepted';
  await request.save();

  // Update exchange statuses
  await request.requestedBook.exchangeDetails.update({ status: 'Reserved' });
  await request.requestedBook.update({ status: 'Unavailable' });
  
  await request.offeredBook.exchangeDetails.update({ status: 'Reserved' });
  await request.offeredBook.update({ status: 'Unavailable' });

  // Reject all other pending requests for this book
  await ExchangeRequest.update(
    { status: 'Rejected' },
    {
      where: {
        requestedBookId: request.requestedBookId,
        status: 'Pending',
        id: { [Op.ne]: id }
      }
    }
  );

  // Notify requester
  await Notification.create({
    userId: request.requesterId,
    message: `Your exchange request for "${request.requestedBook.title}" has been accepted!`,
    type: "general"
  });

  // Notify owner
  await Notification.create({
    userId: req.user.id,
    message: `You have accepted the exchange request for "${request.requestedBook.title}".`,
    type: "general"
  });

  // Notify rejected users
  const rejectedRequests = await ExchangeRequest.findAll({
    where: {
      requestedBookId: request.requestedBookId,
      status: 'Rejected'
    }
  });

  for (const rejected of rejectedRequests) {
    await Notification.create({
      userId: rejected.requesterId,
      message: `Your exchange request for "${request.requestedBook.title}" has been rejected.`,
      type: "general"
    });
  }

  res.status(200).json({ request });
};

const rejectExchangeRequest = async (req, res) => {
  const { id } = req.params;
  
  const request = await ExchangeRequest.findByPk(id, {
    include: [
      { model: Book, as: 'requestedBook' },
      { model: Book, as: 'offeredBook' }
    ]
  });

  if (!request) {
    return res.status(404).json({ msg: `No exchange request found with id ${id}` });
  }

  if (request.ownerId !== req.user.id) {
    return res.status(403).json({ msg: "You are not authorized to reject this request." });
  }

  if (request.status !== 'Pending') {
    return res.status(400).json({ msg: "This request cannot be rejected." });
  }

  request.status = 'Rejected';
  await request.save();

  // Make offered book available again
  await request.offeredBook.exchangeDetails.update({ status: 'Available' });
  await request.offeredBook.update({ status: 'Available' });

  // Notify requester
  await Notification.create({
    userId: request.requesterId,
    message: `Your exchange request for "${request.requestedBook.title}" has been rejected.`,
    type: "general"
  });

  res.status(200).json({ request });
};

const cancelExchangeRequest = async (req, res) => {
  const { id } = req.params;
  
  const request = await ExchangeRequest.findByPk(id, {
    include: [
      { model: Book, as: 'requestedBook' },
      { model: Book, as: 'offeredBook' }
    ]
  });

  if (!request) {
    return res.status(404).json({ msg: `No exchange request found with id ${id}` });
  }

  if (request.requesterId !== req.user.id && request.ownerId !== req.user.id) {
    return res.status(403).json({ msg: "You are not authorized to cancel this request." });
  }

  if (request.status !== 'Pending' && request.status !== 'Accepted') {
    return res.status(400).json({ msg: "This request cannot be cancelled." });
  }

  request.status = 'Cancelled';
  await request.save();

  // Make books available again if they were reserved
  if (request.status === 'Accepted') {
    await request.requestedBook.exchangeDetails.update({ status: 'Available' });
    await request.requestedBook.update({ status: 'Available' });
    
    await request.offeredBook.exchangeDetails.update({ status: 'Available' });
    await request.offeredBook.update({ status: 'Available' });
  } else {
    await request.offeredBook.exchangeDetails.update({ status: 'Available' });
    await request.offeredBook.update({ status: 'Available' });
  }

  // Notify the other party
  const notifyUserId = request.requesterId === req.user.id ? request.ownerId : request.requesterId;
  await Notification.create({
    userId: notifyUserId,
    message: `Exchange request for "${request.requestedBook.title}" has been cancelled.`,
    type: "general"
  });

  res.status(200).json({ request });
};

const updateExchangeRequestStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const validStatuses = ['InDelivery', 'Completed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ msg: "Invalid status. Allowed: 'InDelivery', 'Completed'" });
  }

  const request = await ExchangeRequest.findByPk(id, {
    include: [
      { model: Book, as: 'requestedBook' },
      { model: Book, as: 'offeredBook' }
    ]
  });

  if (!request) {
    return res.status(404).json({ msg: `No exchange request found with id ${id}` });
  }

  if (request.ownerId !== req.user.id) {
    return res.status(403).json({ msg: "You are not authorized to update this request." });
  }

  if (request.status !== 'Accepted') {
    return res.status(400).json({ msg: "Only accepted requests can be updated to InDelivery or Completed." });
  }

  request.status = status;
  await request.save();

  if (status === 'InDelivery') {
    // Create delivery order
    await Order.create({
      buyerId: request.requesterId,
      sellerId: request.ownerId,
      orderType: 'EXCHANGE',
      status: 'InDelivery',
      totalAmount: 0,
      items: [{
        bookId: request.requestedBookId,
        quantity: 1,
        price: 0
      }]
    });

    await Notification.create({
      userId: request.requesterId,
      message: `Exchange for "${request.requestedBook.title}" is now in delivery.`,
      type: "general"
    });
  } else if (status === 'Completed') {
    // Mark exchanges as completed
    await request.requestedBook.exchangeDetails.update({ status: 'Completed' });
    await request.offeredBook.exchangeDetails.update({ status: 'Completed' });

    await Notification.create({
      userId: request.requesterId,
      message: `Exchange for "${request.requestedBook.title}" has been completed successfully!`,
      type: "general"
    });
  }

  res.status(200).json({ request });
};

module.exports = {
  createExchangeRequest,
  getExchangeRequests,
  getExchangeRequestById,
  acceptExchangeRequest,
  rejectExchangeRequest,
  cancelExchangeRequest,
  updateExchangeRequestStatus
};
