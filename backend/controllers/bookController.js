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

const exactCategoryEnums = ['Programming', 'Science', 'Novels', 'Self Development', 'Algebra', 'Mathematics', 'Physics', 'Notes', 'Other'];
const exactCondEnums = ['New', 'Used/Good'];
const exactTypeEnums = ['Sell', 'Rent', 'Share'];

const matchEnum = (arr, val) => {
  let lowerVal = val.toLowerCase().trim();
  // Map any frontend values that might not strictly match the db schema
  if (lowerVal === 'self-development') lowerVal = 'self development';
  if (lowerVal === 'buy') lowerVal = 'sell';
  if (lowerVal === 'free') lowerVal = 'share';
  
  return arr.find(e => e.toLowerCase() === lowerVal) || val;
};

const getAllBooks = async (req, res) => {
  const { category, cats, search, q, type, conds, condition, price, minPrice, maxPrice, sort } = req.query;
  const queryObject = { status: 'Available' };

  const finalCategory = category || cats;
  const finalSearch = search || q;
  const finalCondition = condition || conds;

  if (finalCategory) {
    const categoryList = finalCategory.split(',').map(c => matchEnum(exactCategoryEnums, c));
    queryObject.category = { $in: categoryList };
  }
  if (type) {
    const typeList = type.split(',').map(t => matchEnum(exactTypeEnums, t));
    queryObject.exchangeType = { $in: typeList };
  }
  if (finalSearch) {
    queryObject.$or = [
      { title: { $regex: finalSearch, $options: 'i' } },
      { author: { $regex: finalSearch, $options: 'i' } },
      { category: { $regex: finalSearch, $options: 'i' } },
      { description: { $regex: finalSearch, $options: 'i' } }
    ];
  }
  if (finalCondition) {
    const condArray = finalCondition.split(',').map(c => matchEnum(exactCondEnums, c));
    queryObject.condition = { $in: condArray };
  }
  if (minPrice !== undefined || maxPrice !== undefined || price !== undefined) {
    const finalMin = minPrice !== undefined && minPrice !== '' && !isNaN(Number(minPrice)) ? Number(minPrice) : null;
    const finalMax = maxPrice !== undefined && maxPrice !== '' && !isNaN(Number(maxPrice)) ? Number(maxPrice) : (price !== undefined && price !== '' && !isNaN(Number(price)) ? Number(price) : null);

    if (finalMin !== null || finalMax !== null) {
      queryObject.price = {};
      if (finalMin !== null) queryObject.price.$gte = finalMin;
      if (finalMax !== null) queryObject.price.$lte = finalMax;

      // Crucial explicitly: Ensure that if a user sets max price, "free/share" books might show up (since price=0).
      // Let's filter out "Share" books ONLY if price filter is used AND Type filter doesn't explicitly INCLUDE 'share'.
      if (!type || !type.toLowerCase().includes('share')) {
          queryObject.exchangeType = { $ne: 'Share' };
      }
    }
  }

  let result = Book.find(queryObject).select('-pdf').populate('owner', 'name');

  // Sorting
  if (sort === 'price-asc') {
    result = result.sort('price');
  } else if (sort === 'price-desc') {
    result = result.sort('-price');
  } else if (sort === 'popular') {
    result = result.sort('-views -createdAt');
  } else if (sort === 'random') {
    // Randomization happens after the query
  } else if (sort === 'recent' || !sort) {
    result = result.sort('-createdAt');
  }

  if (sort === 'random') {
    const allBooks = await result;
    const shuffled = allBooks.sort(() => 0.5 - Math.random());
    const limitNum = Number(req.query.limit);
    const books = !isNaN(limitNum) && limitNum > 0 ? shuffled.slice(0, limitNum) : shuffled;
    return res.status(200).json({ books, count: books.length });
  }

  if (req.query.limit) {
    const limitNum = Number(req.query.limit);
    if (!isNaN(limitNum) && limitNum > 0) result = result.limit(limitNum);
  }

  const books = await result;
  res.status(200).json({ books, count: books.length });
};

const getBook = async (req, res) => {
  const { id } = req.params;
  const book = await Book.findById(id).populate('owner', 'name email');
  if (!book) return res.status(404).json({ msg: `No book with id ${id}` });

  // Increment global views
  book.views = (book.views || 0) + 1;
  await book.save({ validateBeforeSave: false });

  // Track views securely if token is present
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = require("jsonwebtoken").verify(token, process.env.JWT_SECRET);
      if (decoded && decoded.id) {
        const user = await User.findById(decoded.id);
        if (user) {
          const viewIndex = user.viewedBooks.findIndex(vb => vb.book && vb.book.toString() === id);
          if (viewIndex > -1) {
            user.viewedBooks[viewIndex].views += 1;
            user.viewedBooks[viewIndex].updatedAt = Date.now();
          } else {
            user.viewedBooks.push({ book: id, category: book.category, views: 1, updatedAt: Date.now() });
          }
          await user.save();
        }
      }
    } catch (e) {
      // ignore invalid tokens for tracking route
    }
  }

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
    if (!user) return res.status(200).json({ books: [] });

    const interests = user.interests || [];
    
    // Extract top categories from viewing behavior (sort by views descending)
    const viewingBehavior = user.viewedBooks || [];
    viewingBehavior.sort((a,b) => b.views - a.views);
    const viewedCategories = viewingBehavior.map(vb => vb.category).filter(Boolean);
    
    const combinedCategories = [...new Set([...interests, ...viewedCategories])];

    let booksRaw = [];
    if (combinedCategories.length > 0) {
      const regexCategories = combinedCategories.map(cat => new RegExp(`^${cat}$`, 'i'));
      
      // Combine and utilize optimized single MongoDB query using $in
      booksRaw = await Book.find({
          category: { $in: regexCategories },
          status: 'Available',
          owner: { $ne: req.user.id }
      }).sort('-createdAt').limit(50).populate('owner', 'name');
    }

    const finalBooks = [];
    const catCount = {};
    for (const book of booksRaw) {
        if (!catCount[book.category]) catCount[book.category] = 0;
        // Limit to 3 books maximum per category
        if (catCount[book.category] < 3) {
            catCount[book.category]++;
            finalBooks.push(book);
        }
        if (finalBooks.length >= 8) break; // Strict UI rule maximum 6-8 books
    }

    // Fallback logic for users with no interests or if their interests have no matched books yet
    if (finalBooks.length === 0) {
      const fallbackBooks = await Book.find({
        status: 'Available',
        owner: { $ne: req.user.id }
      }).sort('-views -createdAt').limit(8).populate('owner', 'name');
      
      return res.status(200).json({ books: fallbackBooks });
    }

    res.status(200).json({ books: finalBooks });
  } catch (error) {
    res.status(500).json({ msg: "Error fetching recommendations", error: error.message });
  }
};

module.exports = { getAllBooks, getBook, createBook, updateBook, deleteBook, getRecommendedBooks };
