const router = require('express').Router();
const { signup, verifyEmail, login, me, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
router.post('/register', signup);
// Preserve the original endpoint for existing API consumers.
router.post('/signup', signup);
router.get('/verify-email', verifyEmail);
router.post('/login', login);
router.get('/me', protect, me);
router.post('/logout', logout);
module.exports = router;
