const { postgres } = require('../config/database');

const { priceCart } = require('../utils/cartPricing');

exports.getCart = async (req, res, next) => {
  try {
    const { rows } = await postgres.query('SELECT items FROM carts WHERE user_id = $1', [req.user.id]);
    res.json({ items: rows[0]?.items || [] });
  } catch (error) { next(error); }
};

exports.updateCart = async (req, res, next) => {
  try {
    const { items: trustedItems } = await priceCart(postgres, req.body?.items);
    const { rows } = await postgres.query(
      `INSERT INTO carts (user_id, items) VALUES ($1, $2::jsonb)
       ON CONFLICT (user_id) DO UPDATE SET items = EXCLUDED.items, updated_at = NOW()
       RETURNING items`,
      [req.user.id, JSON.stringify(trustedItems)],
    );
    res.json({ items: rows[0].items });
  } catch (error) { next(error); }
};
