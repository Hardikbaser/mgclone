const jwt = require('jsonwebtoken');
const { postgres } = require('../config/database');

async function protect(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Authentication is required.' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { rows } = await postgres.query(
      'SELECT id, email, name, role, is_email_verified FROM users WHERE id = $1',
      [payload.userId],
    );
    if (!rows[0] || !rows[0].is_email_verified) return res.status(401).json({ message: 'Your session is no longer valid.' });
    req.user = rows[0];
    next();
  } catch {
    return res.status(401).json({ message: 'Your session is invalid or expired.' });
  }
}

function authorize(...roles) {
  return (req, res, next) => roles.includes(req.user.role)
    ? next()
    : res.status(403).json({ message: 'You do not have permission for this action.' });
}

module.exports = { protect, authorize };
