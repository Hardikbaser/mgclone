const { postgres } = require('../config/database');

const isValidAddress = (address) => address && typeof address === 'object'
  && typeof address.name === 'string' && address.name.trim()
  && typeof address.phone === 'string' && /^\d{10}$/.test(address.phone)
  && typeof address.line1 === 'string' && address.line1.trim()
  && typeof address.city === 'string' && address.city.trim()
  && typeof address.state === 'string' && address.state.trim()
  && typeof address.pincode === 'string' && /^\d{6}$/.test(address.pincode);

exports.getAddress = async (req, res, next) => {
  try {
    const { rows } = await postgres.query('SELECT address FROM saved_addresses WHERE user_id = $1', [req.user.id]);
    return res.json({ address: rows[0]?.address || null });
  } catch (error) { return next(error); }
};

exports.saveAddress = async (req, res, next) => {
  try {
    const { address } = req.body || {};
    if (!isValidAddress(address)) return res.status(400).json({ message: 'A complete delivery address is required.' });
    const { rows } = await postgres.query(
      `INSERT INTO saved_addresses (user_id, address) VALUES ($1, $2::jsonb)
       ON CONFLICT (user_id) DO UPDATE SET address = EXCLUDED.address, updated_at = NOW()
       RETURNING address`, [req.user.id, JSON.stringify(address)],
    );
    return res.json({ address: rows[0].address });
  } catch (error) { return next(error); }
};
