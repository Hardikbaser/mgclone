const Product = require('../models/Product');

// Database-backed catalog used by the Products page. Search is optional so
// clients can fetch the demo catalog and combine search with local filters.
exports.list = async (req, res, next) => {
  try {
    const search = String(req.query.search || req.query.q || '').trim();
    const filter = search
      ? { $or: ['name', 'brand', 'composition', 'category'].map((field) => ({ [field]: { $regex: search, $options: 'i' } })) }
      : {};
    const products = await Product.find(filter).sort({ createdAt: -1 }).limit(100).lean();
    return res.json({ products });
  } catch (error) {
    return next(error);
  }
};
