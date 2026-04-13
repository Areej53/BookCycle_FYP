const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Please provide book title'], trim: true },
  author: { type: String, required: [true, 'Please provide author name'], trim: true },
  description: { type: String, required: [true, 'Please provide description'] },
  condition: { 
    type: String, 
    enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'], 
    required: [true, 'Please provide condition'] 
  },
  category: { 
    type: String, 
    enum: ['Programming', 'Science', 'Novels', 'Self Development', 'Algebra', 'Mathematics', 'Physics', 'Notes', 'Other'],
    required: [true, 'Please provide category'],
    default: 'Other'
  },
  exchangeType: {
    type: String,
    enum: ['Sell', 'Rent', 'Share'],
    required: [true, 'Please specify exchange type']
  },
  price: { type: Number, default: 0 },
  rentWeek: { type: Number, default: 0 },
  rentMonth: { type: Number, default: 0 },
  securityDeposit: { type: Number, default: 0 },
  images: [{ type: String }],
  image: { type: String },
  pdf: { type: String },
  subject: { type: String },
  duration: { type: String },
  status: {
    type: String,
    enum: ['Available', 'Pending', 'Unavailable'],
    default: 'Available'
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Book', BookSchema);
