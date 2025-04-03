const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const productController = require('../controllers/product.controller');
const isAuthenticated = require('../middlewares/isAuthenticated');
const hasRole = require('../middlewares/hasRole');
const { productValidator, productIdValidator, productSearchValidator } = require('../middlewares/validators/product.validator');

const validate = require('../middlewares/validate'); // استيراد الدالة
// إنشاء منتج جديد
router.post(
  '/',
  isAuthenticated, hasRole('admin'),
  productValidator, validate,
  productController.createProduct
);

// جلب جميع المنتجات
router.get('/products', productController.getAllProducts);
router.get('/suggestions',productController.getSuggestions);
// جلب منتج حسب الـ ID
router.get('/:id', productIdValidator, validate, productController.getProductById);

// تعديل منتج حسب الـ ID
router.put('/:id', isAuthenticated, hasRole('admin'), productIdValidator, validate, productController.updateProduct);

// حذف منتج حسب الـ ID
router.delete('/:id', isAuthenticated, hasRole('admin'), productIdValidator, validate, productController.deleteProduct);

// البحث عن منتج حسب الاسم (slug)
router.get('/search/:name', productSearchValidator, validate, productController.searchProductBySlug);


router.post('/favorites/:productId', isAuthenticated,  productController.addToFavorites);
router.get('/favorites/get', isAuthenticated, productController.getFavoriteProducts);
// router.post('/favorites/remove', isAuthenticated, productController.removeFromFavorites);
// البحث عن المنتجات حسب الموقع
router.get('/search', isAuthenticated, productSearchValidator, validate, productController.searchProductsByLocation);

module.exports = router;
