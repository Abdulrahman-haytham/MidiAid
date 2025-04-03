const express = require('express');
const { validationResult } = require('express-validator');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const isAuthenticated = require('../middlewares/isAuthenticated');
const hasRole = require('../middlewares/hasRole');
const categoryValidator = require('../middlewares/validators/category.validator'); // استيراد الفاليديتور

const validate = require('../middlewares/validate'); // استيراد الدالة

// إنشاء فئة (Admin فقط)
router.post('/create', isAuthenticated, hasRole('admin'), categoryValidator, validate, categoryController.createCategory);

// تحديث فئة (Admin فقط)
router.put('/update/:id', isAuthenticated, hasRole('admin'), categoryValidator, validate, categoryController.updateCategory);

// جلب جميع الفئات
router.get('/all', categoryController.getAllCategories);

// جلب فئة واحدة
router.get('/:id', categoryController.getCategoryById);

// البحث عن فئة بالاسم
router.get('/search/:name', categoryController.searchCategory);

// حذف فئة بالـ ID (Admin فقط)
router.delete('/delete/:id', isAuthenticated, hasRole('admin'), categoryController.deleteCategoryById);

// حذف فئة بالاسم (Admin فقط)
router.delete('/delete-by-name/:name', isAuthenticated, hasRole('admin'), categoryController.deleteCategoryByName);

module.exports = router;
