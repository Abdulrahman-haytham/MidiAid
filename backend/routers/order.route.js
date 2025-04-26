const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middlewares/isAuthenticated');
const hasRole = require('../middlewares/hasRole');
const OrderController = require('../controllers/order.controller');
const { orderValidator, orderIdValidator } = require('../middlewares/validators/order.validator');
const { validationResult } = require('express-validator');

const validate = require('../middlewares/validate'); 
// استيراد الدالة
router.post('/create', isAuthenticated, OrderController.createOrder);
router.put('/:orderId/status', isAuthenticated, orderIdValidator, validate, OrderController.updateOrderStatus);
router.get('/pharmacy-orders', isAuthenticated, hasRole('pharmacist'), OrderController.getPharmacyOrders);
router.get('/my-orders', isAuthenticated, OrderController.getUserOrders);
router.get('/:orderId', isAuthenticated, orderIdValidator, validate, OrderController.getOrderDetails);
router.post('/rate/:orderId', isAuthenticated, OrderController.rateOrder);

module.exports = router;
