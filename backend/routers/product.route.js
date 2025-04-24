const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const productController = require('../controllers/product.controller');
const isAuthenticated = require('../middlewares/isAuthenticated');
const hasRole = require('../middlewares/hasRole');
const { productValidator, productIdValidator, productSearchValidator } = require('../middlewares/validators/product.validator');

const validate = require('../middlewares/validate'); 
router.post('/',isAuthenticated, hasRole('admin'), productValidator, validate, productController.createProduct);
router.get('/products', productController.getAllProducts);
router.get('/suggestions',productController.getSuggestions);
router.get('/:id', productIdValidator, validate, productController.getProductById);
router.put('/:id', isAuthenticated, hasRole('admin'), productIdValidator, validate, productController.updateProduct);
router.delete('/:id', isAuthenticated, hasRole('admin'), productIdValidator, validate, productController.deleteProduct);
router.get('/search/:name', productSearchValidator, validate, productController.searchProductBySlug);
router.post('/favorites/:productId', isAuthenticated,  productController.addToFavorites);
router.get('/favorites/get', isAuthenticated, productController.getFavoriteProducts);
// router.post('/favorites/remove', isAuthenticated, productController.removeFromFavorites);
router.get('/search', isAuthenticated, productSearchValidator, validate, productController.searchProductsByLocation);

module.exports = router;
