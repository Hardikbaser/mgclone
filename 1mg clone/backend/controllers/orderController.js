const { postgres } = require('../config/database');

exports.create = async (req, res, next) => {
  try {
    const { items, totalAmount, paymentMethod = 'PENDING', deliveryAddress = {} } = req.body;
    const hasValidAddress = deliveryAddress && typeof deliveryAddress === 'object'
      && typeof deliveryAddress.name === 'string' && deliveryAddress.name.trim()
      && typeof deliveryAddress.phone === 'string' && /^\d{10}$/.test(deliveryAddress.phone)
      && typeof deliveryAddress.line1 === 'string' && deliveryAddress.line1.trim()
      && typeof deliveryAddress.city === 'string' && deliveryAddress.city.trim()
      && typeof deliveryAddress.state === 'string' && deliveryAddress.state.trim()
      && typeof deliveryAddress.pincode === 'string' && /^\d{6}$/.test(deliveryAddress.pincode);
    if (!Array.isArray(items) || !items.length || !Number.isFinite(Number(totalAmount))) return res.status(400).json({ message: 'Order items and total amount are required.' });
    if (!hasValidAddress) return res.status(400).json({ message: 'A complete delivery address is required.' });
    const { rows } = await postgres.query(
      'INSERT INTO orders (user_id, items, total_amount, payment_method, delivery_address) VALUES ($1, $2::jsonb, $3, $4, $5::jsonb) RETURNING id, status, total_amount, created_at',
      [req.user.id, JSON.stringify(items), totalAmount, paymentMethod, JSON.stringify(deliveryAddress)],
    );
    res.status(201).json({ order: rows[0] });
  } catch (error) { next(error); }
};
