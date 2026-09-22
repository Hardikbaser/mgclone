const { postgres } = require('../config/database');

exports.list = async (req, res, next) => {
  try {
    const search = String(req.query.search || req.query.q || '').trim();
    const category = String(req.query.category || '').trim();
    const brand = String(req.query.brand || '').trim();
    const sort = ['price_asc', 'price_desc', 'name'].includes(req.query.sort) ? req.query.sort : 'name';
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(48, Math.max(1, Number.parseInt(req.query.limit, 10) || 24));
    const clauses = [], values = [];
    if (search) { values.push(`%${search}%`); clauses.push(`(name ILIKE $${values.length} OR brand ILIKE $${values.length} OR category ILIKE $${values.length} OR composition ILIKE $${values.length} OR description ILIKE $${values.length})`); }
    if (category) { values.push(category); clauses.push(`category = $${values.length}`); }
    if (brand) { values.push(brand); clauses.push(`brand = $${values.length}`); }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const order = sort === 'price_asc' ? 'price ASC, name ASC' : sort === 'price_desc' ? 'price DESC, name ASC' : 'name ASC';
    const total = await postgres.query(`SELECT COUNT(*)::int AS count FROM products ${where}`, values);
    values.push(limit, (page - 1) * limit);
    const { rows } = await postgres.query(`SELECT id, name, description, composition, brand, category, price::float, mrp::float, stock, image, is_rx_required AS "isRxRequired" FROM products ${where} ORDER BY ${order} LIMIT $${values.length - 1} OFFSET $${values.length}`, values);
    return res.json({ products: rows, page, limit, total: total.rows[0].count, pages: Math.ceil(total.rows[0].count / limit) });
  } catch (error) {
    return next(error);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(req.params.id);
    const column = isUuid ? 'id' : 'slug';
    const { rows } = await postgres.query(`SELECT id, name, description, composition, brand, category, price::float, mrp::float, stock, image, is_rx_required AS "isRxRequired" FROM products WHERE ${column} = $1`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: 'Product not found.' });
    return res.json({ product: rows[0] });
  } catch (error) { return next(error); }
};
