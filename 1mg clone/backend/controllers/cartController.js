const { postgres } = require('../config/database');

const normalizeItems = (items) => Array.isArray(items)
  ? items.filter((item) => item && typeof item.id === 'string' && typeof item.name === 'string' && Number.isFinite(Number(item.price)))
  : null;

exports.getCart = async (req, res, next) => {
  try {
    const { rows } = await postgres.query('SELECT items FROM carts WHERE user_id = $1', [req.user.id]);
    res.json({ items: rows[0]?.items || [] });
  } catch (error) { next(error); }
};

exports.updateCart = async (req, res, next) => {
  try {
    const items = normalizeItems(req.body?.items);
    if (!items) return res.status(400).json({ message: 'Cart items must be an array.' });
    const { rows } = await postgres.query(
      `INSERT INTO carts (user_id, items) VALUES ($1, $2::jsonb)
       ON CONFLICT (user_id) DO UPDATE SET items = EXCLUDED.items, updated_at = NOW()
       RETURNING items`,
      [req.user.id, JSON.stringify(items)],
    );
    res.json({ items: rows[0].items });
  } catch (error) { next(error); }
};
