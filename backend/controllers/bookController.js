const { Book, User, UserViewedBook, Rent, Exchange } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../db/connectPostgres');
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

const exactCategoryEnums = ['Programming', 'Science', 'Novels', 'Self Development', 'Algebra', 'Mathematics', 'Physics', 'Notes', 'Other'];
const exactCondEnums = ['New', 'Used/Good'];
const exactTypeEnums = ['Sell', 'Rent', 'Exchange'];

const matchEnum = (arr, val) => {
  let lowerVal = val.toLowerCase().trim();
  if (lowerVal === 'self-development') lowerVal = 'self development';
  if (lowerVal === 'buy') lowerVal = 'sell';
  if (lowerVal === 'free') lowerVal = 'exchange';
  
  return arr.find(e => e.toLowerCase() === lowerVal) || val;
};

const getAllBooks = async (req, res) => {
  const { category, cats, search, q, type, conds, condition, price, minPrice, maxPrice, sort, sellerId } = req.query;
  
  const whereClause = sellerId ? { ownerId: sellerId } : { status: 'Available' };

  const finalCategory = category || cats;
  const finalSearch = search || q;
  const finalCondition = condition || conds;

  if (finalCategory) {
    const categoryList = finalCategory.split(',').map(c => matchEnum(exactCategoryEnums, c));
    whereClause.category = { [Op.in]: categoryList };
  }
  if (type) {
    const typeList = type.split(',').map(t => matchEnum(exactTypeEnums, t));
    whereClause.exchangeType = { [Op.in]: typeList };
  }
  if (finalSearch) {
    whereClause[Op.or] = [
      { title: { [Op.iLike]: `%${finalSearch}%` } },
      { author: { [Op.iLike]: `%${finalSearch}%` } },
      { category: { [Op.iLike]: `%${finalSearch}%` } },
      { description: { [Op.iLike]: `%${finalSearch}%` } }
    ];
  }
  if (finalCondition) {
    const condArray = finalCondition.split(',').map(c => matchEnum(exactCondEnums, c));
    whereClause.condition = { [Op.in]: condArray };
  }
  if (minPrice !== undefined || maxPrice !== undefined || price !== undefined) {
    const finalMin = minPrice !== undefined && minPrice !== '' && !isNaN(Number(minPrice)) ? Number(minPrice) : null;
    const finalMax = maxPrice !== undefined && maxPrice !== '' && !isNaN(Number(maxPrice)) ? Number(maxPrice) : (price !== undefined && price !== '' && !isNaN(Number(price)) ? Number(price) : null);

    if (finalMin !== null || finalMax !== null) {
      whereClause.price = {};
      if (finalMin !== null) whereClause.price[Op.gte] = finalMin;
      if (finalMax !== null) whereClause.price[Op.lte] = finalMax;

      if (!type || !type.toLowerCase().includes('share')) {
        whereClause.exchangeType = { ...whereClause.exchangeType, [Op.ne]: 'Share' };
      }
    }
  }

  if (req.query.duration) {
    const durationList = req.query.duration.split(',');
    whereClause.duration = { [Op.in]: durationList };
  }

  if (!sellerId) {
    // For Rent books, only show if they have an Available rent record
    // For Exchange books, only show if they have an Available exchange record
    // For Sell books, show normally
    if (!whereClause[Op.and]) whereClause[Op.and] = [];
    whereClause[Op.and].push(
      sequelize.where(
        sequelize.literal(`(
          "Book"."exchangeType" != 'Rent' OR 
          EXISTS (
            SELECT 1 FROM rents 
            WHERE rents."bookId" = "Book"."id" 
            AND rents.status = 'Available'
          )
        ) AND (
          "Book"."exchangeType" != 'Exchange' OR 
          EXISTS (
            SELECT 1 FROM exchanges 
            WHERE exchanges."bookId" = "Book"."id" 
            AND exchanges.status = 'Available'
          )
        )`),
        true
      )
    );
  }

  // Parse Sorting
  let sequelizeOrder = [['createdAt', 'DESC']];
  if (sort === 'price-asc') {
    sequelizeOrder = [['price', 'ASC']];
  } else if (sort === 'price-desc') {
    sequelizeOrder = [['price', 'DESC']];
  } else if (sort === 'popular') {
    sequelizeOrder = [['views', 'DESC'], ['createdAt', 'DESC']];
  }

  let limitNum = undefined;
  if (req.query.limit) {
    const parsedLimit = Number(req.query.limit);
    if (!isNaN(parsedLimit) && parsedLimit > 0) {
      limitNum = parsedLimit;
    }
  }

  if (sort === 'random') {
    const allBooks = await Book.findAll({
      where: whereClause,
      attributes: { exclude: ['pdf'] },
      include: [
        { model: User, as: 'owner', attributes: ['name'] },
        { model: Rent, as: 'rentDetails' },
        { model: Exchange, as: 'exchangeDetails' }
      ]
    });
    const shuffled = allBooks.sort(() => 0.5 - Math.random());
    const books = limitNum ? shuffled.slice(0, limitNum) : shuffled;
    return res.status(200).json({ books, count: books.length });
  }

  const books = await Book.findAll({
    where: whereClause,
    attributes: { exclude: ['pdf'] },
    include: [
      { model: User, as: 'owner', attributes: ['name'] },
      { model: Rent, as: 'rentDetails' },
      { model: Exchange, as: 'exchangeDetails' }
    ],
    order: sequelizeOrder,
    limit: limitNum
  });

  res.status(200).json({ books, count: books.length });
};

const getBook = async (req, res) => {
  const { id } = req.params;
  const book = await Book.findByPk(id, {
    attributes: { exclude: ['pdf'] },
    include: [
      { model: User, as: 'owner', attributes: ['name', 'email'] },
      { model: Rent, as: 'rentDetails' },
      { model: Exchange, as: 'exchangeDetails' }
    ]
  });
  if (!book) return res.status(404).json({ msg: `No book with id ${id}` });

  // Increment global views
  book.views = (book.views || 0) + 1;
  await book.save();

  // Track views securely if token is present
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = require("jsonwebtoken").verify(token, process.env.JWT_SECRET);
      if (decoded && decoded.id) {
        const user = await User.findByPk(decoded.id);
        if (user) {
          const [viewRecord, created] = await UserViewedBook.findOrCreate({
            where: { userId: decoded.id, bookId: id },
            defaults: { category: book.category, views: 1 }
          });
          if (!created) {
            viewRecord.views += 1;
            await viewRecord.save();
          }
        }
      }
    } catch (e) {
      // ignore invalid tokens for tracking route
    }
  }

  res.status(200).json({ book });
};

const createBook = async (req, res) => {
  req.body.ownerId = req.body.sellerId || req.user.id;
  if (req.body.type) {
    req.body.exchangeType = matchEnum(exactTypeEnums, req.body.type);
  }
  if (req.body.status) {
    const statusMap = {
      live: "Available",
      sold: "Unavailable",
      rented: "Unavailable",
      pending: "Pending",
    };
    req.body.status = statusMap[String(req.body.status).toLowerCase()] || req.body.status;
  }
  
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
  const book = await Book.findOne({ where: { id, ownerId: req.user.id } });
  if (!book) return res.status(404).json({ msg: `No book with id ${id} found for user` });
  
  if (req.body.image) {
    req.body.image = saveBase64Image(req.body.image);
  }
  if (req.body.images && Array.isArray(req.body.images)) {
    req.body.images = req.body.images.map(img => saveBase64Image(img));
  }

  await book.update(req.body);

  // Sync with Rent details
  let rent = await Rent.findOne({ where: { bookId: book.id } });
  if (book.exchangeType === 'Rent') {
    const rentPriceVal = req.body.price !== undefined ? Number(req.body.price) : book.price;
    const rentDurationVal = req.body.duration || book.duration || '3 Months';
    if (!rent) {
      await Rent.create({
        bookId: book.id,
        rentalDuration: rentDurationVal,
        rentPrice: rentPriceVal,
        status: 'Available'
      });
    } else {
      const rentPayload = {};
      if (req.body.duration) rentPayload.rentalDuration = req.body.duration;
      if (req.body.price !== undefined) rentPayload.rentPrice = Number(req.body.price);
      if (req.body.status) {
        const bookStatusToRentStatus = {
          'Available': 'Available',
          'Unavailable': 'Rented'
        };
        rentPayload.status = bookStatusToRentStatus[req.body.status] || rent.status;
      }
      await rent.update(rentPayload);
    }
  } else {
    if (rent) {
      await rent.destroy();
    }
  }

  // Sync with Exchange details
  let exchange = await Exchange.findOne({ where: { bookId: book.id } });
  if (book.exchangeType === 'Exchange') {
    if (!exchange) {
      await Exchange.create({
        bookId: book.id,
        ownerId: book.ownerId,
        title: book.title,
        author: book.author,
        category: book.category,
        condition: book.condition,
        description: book.description,
        images: book.images,
        lookingFor: req.body.lookingFor || null,
        listingType: 'Exchange',
        status: book.status === 'Available' ? 'Available' : 'Reserved'
      });
    } else {
      const exchangePayload = {};
      if (req.body.lookingFor !== undefined) exchangePayload.lookingFor = req.body.lookingFor;
      if (req.body.status) {
        const bookStatusToExchangeStatus = {
          'Available': 'Available',
          'Unavailable': 'Reserved'
        };
        exchangePayload.status = bookStatusToExchangeStatus[req.body.status] || exchange.status;
      }
      await exchange.update(exchangePayload);
    }
  } else {
    if (exchange) {
      await exchange.destroy();
    }
  }

  res.status(200).json({ book });
};

const deleteBook = async (req, res) => {
  const { id } = req.params;
  const book = await Book.findOne({ where: { id, ownerId: req.user.id } });
  if (!book) return res.status(404).json({ msg: `No book with id ${id} found for user` });
  
  await book.destroy();
  res.status(200).json({ msg: "Book deleted" });
};

const getRecommendedBooks = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(200).json({ books: [] });

    const interests = user.interests || [];
    
    // Extract top categories from viewing behavior
    const viewingBehavior = await UserViewedBook.findAll({
      where: { userId: req.user.id },
      order: [['views', 'DESC']]
    });
    const viewedCategories = viewingBehavior.map(vb => vb.category).filter(Boolean);
    
    const combinedCategories = [...new Set([...interests, ...viewedCategories])];

    let booksRaw = [];
    if (combinedCategories.length > 0) {
      const categoryOrConditions = combinedCategories.map(cat => ({
        category: { [Op.iLike]: cat }
      }));
      
      booksRaw = await Book.findAll({
        where: {
          [Op.or]: categoryOrConditions,
          status: 'Available',
          ownerId: { [Op.ne]: req.user.id },
          [Op.and]: [
            sequelize.where(
              sequelize.literal(`(
                "Book"."exchangeType" != 'Rent' OR 
                EXISTS (
                  SELECT 1 FROM rents 
                  WHERE rents."bookId" = "Book"."id" 
                  AND rents.status = 'Available'
                )
              ) AND (
                "Book"."exchangeType" != 'Exchange' OR 
                EXISTS (
                  SELECT 1 FROM exchanges 
                  WHERE exchanges."bookId" = "Book"."id" 
                  AND exchanges.status = 'Available'
                )
              )`),
              true
            )
          ]
        },
        order: [['createdAt', 'DESC']],
        limit: 50,
        include: [
          { model: User, as: 'owner', attributes: ['name'] },
          { model: Rent, as: 'rentDetails' },
          { model: Exchange, as: 'exchangeDetails' }
        ]
      });
    }

    const finalBooks = [];
    const catCount = {};
    for (const book of booksRaw) {
        const catKey = book.category.toLowerCase();
        if (!catCount[catKey]) catCount[catKey] = 0;
        if (catCount[catKey] < 3) {
            catCount[catKey]++;
            finalBooks.push(book);
        }
        if (finalBooks.length >= 8) break;
    }

    if (finalBooks.length === 0) {
      const fallbackBooks = await Book.findAll({
        where: {
          status: 'Available',
          ownerId: { [Op.ne]: req.user.id },
          [Op.and]: [
            sequelize.where(
              sequelize.literal(`(
                "Book"."exchangeType" != 'Rent' OR 
                EXISTS (
                  SELECT 1 FROM rents 
                  WHERE rents."bookId" = "Book"."id" 
                  AND rents.status = 'Available'
                )
              ) AND (
                "Book"."exchangeType" != 'Exchange' OR 
                EXISTS (
                  SELECT 1 FROM exchanges 
                  WHERE exchanges."bookId" = "Book"."id" 
                  AND exchanges.status = 'Available'
                )
              )`),
              true
            )
          ]
        },
        order: [
          ['views', 'DESC'],
          ['createdAt', 'DESC']
        ],
        limit: 8,
        include: [
          { model: User, as: 'owner', attributes: ['name'] },
          { model: Rent, as: 'rentDetails' },
          { model: Exchange, as: 'exchangeDetails' }
        ]
      });
      
      return res.status(200).json({ books: fallbackBooks });
    }

    res.status(200).json({ books: finalBooks });
  } catch (error) {
    res.status(500).json({ msg: "Error fetching recommendations", error: error.message });
  }
};

const getBookPdf = async (req, res) => {
  const { id } = req.params;
  const book = await Book.findByPk(id, { attributes: ['pdf'] });
  if (!book) return res.status(404).json({ msg: `No book with id ${id}` });
  res.status(200).json({ pdf: book.pdf || null });
};

module.exports = { getAllBooks, getBook, createBook, updateBook, deleteBook, getRecommendedBooks, getBookPdf };
