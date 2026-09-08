const router = require('express').Router();
const { getCart, updateCart } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getCart);
router.put('/', protect, updateCart);

module.exports = router;
