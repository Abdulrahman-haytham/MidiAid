const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator'); 
const productController = require('../controllers/product.controller');
const isAuthenticated = require('../middlewares/isAuthenticated');
const hasRole = require('../middlewares/hasRole');
const { productValidator, productIdValidator, productSearchValidator } = require('../middlewares/validators/product.validator');

const validate = require('../middlewares/validate'); 

router.post('/', isAuthenticated, hasRole('admin'), productValidator, validate, productController.createProduct);


router.get('/products', productController.getAllProducts); 
router.get('/suggestions', productController.getSuggestions); 
router.get('/favorites/get', isAuthenticated, productController.getFavoriteProducts); 
router.get('/search', isAuthenticated, productSearchValidator, validate, productController.searchProductsByLocation); 

router.get('/search/:name', productSearchValidator, validate, productController.searchProductBySlug); 


router.get('/:id', productIdValidator, validate, productController.getProductById);

router.put('/:id', isAuthenticated, hasRole('admin'), productIdValidator, validate, productController.updateProduct);


router.delete('/:id', isAuthenticated, hasRole('admin'), productIdValidator, validate, productController.deleteProduct);

router.post('/favorites/:productId', isAuthenticated, productController.addToFavorites);
router.post('/toggleFavorite/:productId', isAuthenticated, productController.toggleFavorite);

// router.post('/favorites/remove', isAuthenticated, productController.removeFromFavorites);


module.exports = router;