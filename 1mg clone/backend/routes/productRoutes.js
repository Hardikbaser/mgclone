const router = require('express').Router();
const { list } = require('../controllers/productController');
router.get('/search', list);
router.get('/', list);
module.exports = router;
