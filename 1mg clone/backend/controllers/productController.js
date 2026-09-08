const Product = require('../models/Product');

exports.list = async (req, res, next) => {
  try {
    const search = String(req.query.search || '').trim();
    const filter = search ? { $or: ['name', 'brand', 'composition', 'category'].map((field) => ({ [field]: { $regex: search, $options: 'i' } })) } : {};
    res.json({ products: await Product.find(filter).sort({ createdAt: -1 }).limit(100).lean() });
  } catch (error) { next(error); }
};
