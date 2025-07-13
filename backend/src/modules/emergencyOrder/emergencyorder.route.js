const express = require('express');
const router = express.Router();
const emergencyOrderController = require('./emergencyorder.controller');

// Create a new emergency order
router.post('/createEmergencyOrder', emergencyOrderController.createEmergencyOrder);

// Get a specific emergency order by ID
router.get('/getEmergencyOrder/:id', emergencyOrderController.getEmergencyOrder);

// Get all emergency orders for a specific user
router.get('/getUserEmergencyOrders/:userId', emergencyOrderController.getUserEmergencyOrders);

// Get all emergency orders sent to a specific pharmacy
router.get('/getPharmacyOrders/:pharmacyId', emergencyOrderController.getPharmacyOrders);

// Pharmacy responds to an emergency order
router.post('/respondToEmergencyOrder', emergencyOrderController.respondToEmergencyOrder);

// Cancel an emergency order
router.post('/cancelEmergencyOrder', emergencyOrderController.cancelEmergencyOrder);

module.exports = router;