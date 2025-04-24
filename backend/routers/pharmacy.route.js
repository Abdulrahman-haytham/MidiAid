const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const isAuthenticated = require('../middlewares/isAuthenticated');
const hasRole = require('../middlewares/hasRole');
const pharmacyController = require('../controllers/pharmacy.controller');
const { pharmacyValidator, pharmacyIdValidator, pharmacyRateValidator } = require('../middlewares/validators/pharmacy.validator');

const validate = require('../middlewares/validate');

// استيراد الدالة
router.post('/',isAuthenticated, hasRole('pharmacist'),pharmacyController.createPharmacy);
router.put('/updatePharmacy', isAuthenticated, hasRole('pharmacist'),pharmacyController.updatePharmacy)
router.get('/', pharmacyController.getAllPharmacies);
router.get('/getMyPharmacy',isAuthenticated, hasRole('pharmacist'), pharmacyController.getMyPharmacy);
router.get('/getMyPharmacyOrders',isAuthenticated,hasRole('pharmacist'),pharmacyController.getMyPharmacyOrders)
router.post('/:id/rate', isAuthenticated, pharmacyRateValidator, validate, pharmacyController.ratePharmacy);
router.get('/checkUserHasPharmacy',isAuthenticated,pharmacyController.checkUserHasPharmacy);
router.get('/getPharmacyMedicines/:id',pharmacyController.getPharmacyMedicines);
router.get('/pharmacies/:pharmacyId/search-medicine', pharmacyController.searchMedicineInPharmacy);
router.get('/getPharmacyDetails/:id',pharmacyController.getPharmacyDetails);
router.post('/add-product', isAuthenticated, hasRole('pharmacist'), pharmacyController.addProductToPharmacy);
router.get('/nearby', pharmacyController.findNearbyPharmacies);
router.post('/create-product', isAuthenticated, hasRole('pharmacist'), pharmacyController.createProduct);
// router.get('/getPharmacyMedicines/:pharmacyId', pharmacyController.getPharmacyMedicines);
module.exports = router;
