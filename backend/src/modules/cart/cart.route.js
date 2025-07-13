const express = require('express');
const { validationResult } = require('express-validator');
const router = express.Router();
const cartController = require('./cart.controller'); // استيراد الكنترولر
const cartValidator = require('./cart.validator'); // استيراد الفاليديتور
const isAuthenticated = require('../../core/middlewares/isAuthenticated'); // التأكد من تسجيل الدخول

const validate = require('../../core/middlewares/validate'); // استيراد الدالة
// تعريف المسارات
router.post('/add', isAuthenticated, cartValidator, validate, cartController.addToCart); // التحقق من المدخلات قبل إضافة المنتج إلى السلة
router.get('/', isAuthenticated, cartController.getCart); // عرض السلة
router.put('/update/:productId', isAuthenticated, cartController.updateCartItem); // تحديث العنصر في السلة
router.delete('/remove/:productId', isAuthenticated, cartController.removeFromCart); // إزالة العنصر من السلة
router.delete('/clear', isAuthenticated, cartController.clearCart); // مسح السلة

module.exports = router;
