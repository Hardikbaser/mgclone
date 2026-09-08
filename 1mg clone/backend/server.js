require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { connectDatabases } = require('./config/database');

const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: true, legacyHeaders: false }));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/account', require('./routes/accountRoutes'));
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use((error, _req, res, _next) => {
  if (error?.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Request body must be valid JSON.' });
  }
  console.error(error);
  return res.status(500).json({ message: 'Something went wrong. Please try again.' });
});

const port = Number(process.env.PORT || 5000);
connectDatabases().then(() => app.listen(port, () => console.log(`API listening on port ${port}`))).catch((error) => { console.error('Database connection failed:', error); process.exit(1); });
