const express = require('express');
const router = express.Router();
const emergencyOrderController = require('./emergencyorder.controller');
// ✅ تعديل: استيراد طبقات الحماية
const isAuthenticated = require('../../core/middlewares/isAuthenticated');
const hasRole = require('../../core/middlewares/hasRole');




// User creates a new emergency order
router.post('/create', isAuthenticated, emergencyOrderController.createEmergencyOrder);

// User gets their emergency orders
router.get('/my-orders', isAuthenticated, emergencyOrderController.getUserEmergencyOrders);

// Pharmacy gets its pending emergency orders
router.get('/pharmacy-orders', isAuthenticated, hasRole('pharmacist'), emergencyOrderController.getPharmacyOrders);

// Get details of a specific order (accessible by user or involved pharmacy)
router.get('/:id', isAuthenticated, emergencyOrderController.getEmergencyOrder);

// Pharmacy responds to an order
router.put('/:orderId/respond', isAuthenticated, hasRole('pharmacist'), emergencyOrderController.respondToEmergencyOrder);

// User cancels their own order
router.put('/:orderId/cancel', isAuthenticated, emergencyOrderController.cancelEmergencyOrder);

//  User or Pharmacist marks an order as fulfilled
router.put('/:orderId/fulfill', isAuthenticated, emergencyOrderController.fulfillEmergencyOrder);


module.exports = router;