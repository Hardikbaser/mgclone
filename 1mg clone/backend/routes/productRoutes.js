const router = require('express').Router();
const { list, getOne } = require('../controllers/productController');
router.get('/search', list);
router.get('/', list);
router.get('/:id', getOne);
module.exports = router;
