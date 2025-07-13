const express = require('express');
const router = express.Router();
const pharmacyController = require('./pharmacy.controller');
const isAuthenticated = require('../../core/middlewares/isAuthenticated');
const hasRole = require('../../core/middlewares/hasRole');
const validate = require('../../core/middlewares/validate');
const {
  createPharmacyValidator,
  updatePharmacyValidator,
  pharmacyIdValidator,
  pharmacyRateValidator,
  searchMedicineValidator,
  nearbyPharmaciesValidator,
  addProductValidator,
  createProductValidator,
} = require('./pharmacy.validator');

// Routes for pharmacies
router.post(
  '/',
  isAuthenticated,
  hasRole('pharmacist'),
  createPharmacyValidator,
  validate,
  pharmacyController.createPharmacy
);

router.put(
  '/updatePharmacy',
  isAuthenticated,
  hasRole('pharmacist'),
  updatePharmacyValidator,
  validate,
  pharmacyController.updatePharmacy
);

router.get(
  '/',
  pharmacyController.getAllPharmacies
);

router.get(
  '/getMyPharmacy',
  isAuthenticated,
  hasRole('pharmacist'),
  pharmacyController.getMyPharmacy
);

router.get(
  '/getMyPharmacyOrders',
  isAuthenticated,
  hasRole('pharmacist'),
  pharmacyController.getMyPharmacyOrders
);

router.post(
  '/:id/rate',
  isAuthenticated,
  pharmacyRateValidator,
  validate,
  pharmacyController.ratePharmacy
);

router.get(
  '/checkUserHasPharmacy',
  isAuthenticated,
  pharmacyController.checkUserHasPharmacy
);

router.get(
  '/getPharmacyMedicines/:id',
  pharmacyIdValidator,
  validate,
  pharmacyController.getPharmacyMedicines
);

router.get(
  '/pharmacies/:pharmacyId/search-medicine',
  searchMedicineValidator,
  validate,
  pharmacyController.searchMedicineInPharmacy
);

router.get(
  '/getPharmacyDetails/:id',
  pharmacyIdValidator,
  validate,
  pharmacyController.getPharmacyDetails
);

router.post(
  '/add-product',
  isAuthenticated,
  hasRole('pharmacist'),
  addProductValidator,
  validate,
  pharmacyController.addProductToPharmacy
);

router.get(
  '/nearby',
  nearbyPharmaciesValidator,
  validate,
  pharmacyController.findNearbyPharmacies
);

router.post(
  '/create-product',
  isAuthenticated,
  hasRole('pharmacist'),
  createProductValidator,
  validate,
  pharmacyController.createProduct
);

router.get(
  '/getPharmacyNamefromcart',
  isAuthenticated,
  pharmacyController.getPharmacyNamefromcart
);

module.exports = router;