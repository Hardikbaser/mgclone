const router = require('express').Router();
const { getAddress, saveAddress } = require('../controllers/accountController');
const { protect } = require('../middleware/auth');

router.get('/address', protect, getAddress);
router.put('/address', protect, saveAddress);

module.exports = router;
