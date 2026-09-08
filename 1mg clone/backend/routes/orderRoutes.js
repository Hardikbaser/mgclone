const router = require('express').Router();
const { create } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
router.post('/', protect, create);
module.exports = router;
