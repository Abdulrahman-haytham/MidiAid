const express = require('express');
const router = express.Router();
const emergencyOrderController = require('./emergencyorder.controller');
const isAuthenticated = require('../../core/middlewares/isAuthenticated');
const hasRole = require('../../core/middlewares/hasRole');




router.post('/create', isAuthenticated, emergencyOrderController.createEmergencyOrder);

router.get('/my-orders', isAuthenticated, emergencyOrderController.getUserEmergencyOrders);

router.get('/pharmacy-orders', isAuthenticated, hasRole('pharmacist'), emergencyOrderController.getPharmacyOrders);

router.get('/:id', isAuthenticated, emergencyOrderController.getEmergencyOrder);

router.put('/:orderId/respond', isAuthenticated, hasRole('pharmacist'), emergencyOrderController.respondToEmergencyOrder);

router.put('/:orderId/cancel', isAuthenticated, emergencyOrderController.cancelEmergencyOrder);

router.put('/:orderId/fulfill', isAuthenticated, emergencyOrderController.fulfillEmergencyOrder);


module.exports = router;