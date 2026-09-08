const mongoose = require('mongoose');

module.exports = mongoose.model('Product', new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  brand: { type: String, trim: true },
  composition: { type: String, trim: true },
  price: { type: Number, required: true, min: 0 },
  mrp: { type: Number, min: 0 },
  category: { type: String, trim: true },
  image: { type: String, default: '/assets/product-placeholder.svg' },
  isRxRequired: { type: Boolean, default: false },
  stock: { type: Number, default: 0, min: 0 },
}, { timestamps: true }));
