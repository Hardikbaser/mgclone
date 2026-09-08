const router = require('express').Router();
const { createRazorpayOrder, verifyRazorpayPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/razorpay/order', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyRazorpayPayment);

module.exports = router;
