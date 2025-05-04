const express = require('express');
const { validationResult } = require('express-validator');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const isAuthenticated = require('../middlewares/isAuthenticated');
const hasRole = require('../middlewares/hasRole');
const categoryValidator = require('../middlewares/validators/category.validator'); // استيراد الفاليديتور

const validate = require('../middlewares/validate'); // استيراد الدالة

router.post('/create', isAuthenticated, hasRole('admin'), categoryValidator, validate, categoryController.createCategory);
router.put('/update/:id', isAuthenticated, hasRole('admin'), categoryValidator, validate, categoryController.updateCategory);
router.get('/all', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.get('/search/:name', categoryController.searchCategory);
router.delete('/delete/:id', isAuthenticated, hasRole('admin'), categoryController.deleteCategoryById);
router.delete('/delete-by-name/:name', isAuthenticated, hasRole('admin'), categoryController.deleteCategoryByName);
router.get('/getProductsByCategory/:categoryId', categoryController.getProductsByCategory);

module.exports = router;
