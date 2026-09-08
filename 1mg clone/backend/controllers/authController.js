const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { postgres } = require('../config/database');
const { sendVerificationEmail } = require('../utils/email');

const publicUser = ({ id, email, name, role }) => ({ id, email, name, role });
const cookieOptions = () => ({ httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000, path: '/' });

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password || password.length < 8) return res.status(400).json({ message: 'Name, a valid email, and a password of at least 8 characters are required.' });
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await postgres.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
    if (existing.rowCount) return res.status(409).json({ message: 'An account already exists for this email.' });

    const passwordHash = await bcrypt.hash(password, 12);
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const { rows } = await postgres.query(
      `INSERT INTO users (name, email, password_hash, verification_token_hash, verification_token_expires_at)
       VALUES ($1, $2, $3, $4, NOW() + INTERVAL '24 hours') RETURNING id, email, name, role`,
      [name.trim(), normalizedEmail, passwordHash, tokenHash],
    );
    try { await sendVerificationEmail(normalizedEmail, rawToken); } catch (mailError) { await postgres.query('DELETE FROM users WHERE id = $1', [rows[0].id]); throw mailError; }
    return res.status(201).json({ message: 'Account created. Check your email to verify it before signing in.', user: publicUser(rows[0]) });
  } catch (error) { next(error); }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token || typeof token !== 'string') return res.status(400).json({ message: 'A verification token is required.' });
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const result = await postgres.query(
      `UPDATE users SET is_email_verified = TRUE, verification_token_hash = NULL, verification_token_expires_at = NULL
       WHERE verification_token_hash = $1 AND verification_token_expires_at > NOW() AND is_email_verified = FALSE
       RETURNING id, email, name, role`, [tokenHash],
    );
    if (!result.rowCount) return res.status(400).json({ message: 'This verification link is invalid, expired, or has already been used.' });
    return res.json({ message: 'Email verified. You can now sign in.', user: publicUser(result.rows[0]) });
  } catch (error) { next(error); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { rows } = await postgres.query('SELECT * FROM users WHERE email = $1', [email?.trim().toLowerCase()]);
    const user = rows[0];
    if (!user || !await bcrypt.compare(password || '', user.password_hash)) return res.status(401).json({ message: 'Invalid email or password.' });
    if (!user.is_email_verified) return res.status(403).json({ message: 'Please verify your email before signing in.' });
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    res.cookie('token', token, cookieOptions());
    return res.json({ message: 'Welcome back.', user: publicUser(user) });
  } catch (error) { next(error); }
};

exports.me = (req, res) => res.json({ user: publicUser(req.user) });
exports.logout = (_req, res) => { res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' }); res.status(204).end(); };
