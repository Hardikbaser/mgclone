const router = require('express').Router();
const { create, list } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
router.post('/', protect, create);
router.get('/', protect, list);
module.exports = router;
