const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middlewares/isAuthenticated');
const hasRole = require('../middlewares/hasRole');
const OrderController = require('../controllers/order.controller');
const { orderValidator, orderIdValidator } = require('../middlewares/validators/order.validator');
const { validationResult } = require('express-validator');

const validate = require('../middlewares/validate'); // استيراد الدالة
// مسارات الطلبات

// إنشاء طلب جديد
router.post('/create', isAuthenticated, orderValidator, validate, OrderController.createOrder);

// تحديث حالة الطلب
router.put('/:orderId/status', isAuthenticated, orderIdValidator, validate, OrderController.updateOrderStatus);

// جلب طلبات الصيدلية
router.get('/pharmacy-orders', isAuthenticated, hasRole('pharmacist'), OrderController.getPharmacyOrders);

// جلب طلبات المستخدم
router.get('/my-orders', isAuthenticated, OrderController.getUserOrders);

// جلب تفاصيل طلب بناءً على ID
router.get('/:orderId', isAuthenticated, orderIdValidator, validate, OrderController.getOrderDetails);

// تقييم طلب
router.post('/rate/:orderId', isAuthenticated, OrderController.rateOrder);

module.exports = router;
