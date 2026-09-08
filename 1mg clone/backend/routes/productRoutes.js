const router = require('express').Router();
const { list } = require('../controllers/productController');
router.get('/', list);
module.exports = router;
