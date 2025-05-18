const express = require('express');
const router = express.Router();
const pharmacyController = require('../controllers/pharmacy.controller');
const isAuthenticated = require('../middlewares/isAuthenticated');
const hasRole = require('../middlewares/hasRole');
const validate = require('../middlewares/validate');
const {
  createPharmacyValidator,
  updatePharmacyValidator,
  pharmacyIdValidator,
  pharmacyRateValidator,
  searchMedicineValidator,
  nearbyPharmaciesValidator,
  addProductValidator,
  createProductValidator,
} = require('../middlewares/validators/pharmacy.validator');

// مسارات الصيدليات
router.post(
  '/pharmacies',
  isAuthenticated,
  hasRole('pharmacist'),
  createPharmacyValidator,
  validate,
  pharmacyController.createPharmacy
);

router.put(
  '/pharmacies',
  isAuthenticated,
  hasRole('pharmacist'),
  updatePharmacyValidator,
  validate,
  pharmacyController.updatePharmacy
);

router.get('/pharmacies', pharmacyController.getAllPharmacies);

router.get(
  '/pharmacies/my-pharmacy',
  isAuthenticated,
  hasRole('pharmacist'),
  pharmacyController.getMyPharmacy
);

router.get(
  '/pharmacies/my-pharmacy/orders',
  isAuthenticated,
  hasRole('pharmacist'),
  pharmacyController.getMyPharmacyOrders
);

router.post(
  '/pharmacies/:id/rate',
  isAuthenticated,
  pharmacyRateValidator,
  validate,
  pharmacyController.ratePharmacy
);

router.get(
  '/pharmacies/check',
  isAuthenticated,
  pharmacyController.checkUserHasPharmacy
);

router.get(
  '/pharmacies/:id/medicines',
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
  '/pharmacies/:id',
  pharmacyIdValidator,
  validate,
  pharmacyController.getPharmacyDetails
);

router.post(
  '/pharmacies/add-product',
  isAuthenticated,
  hasRole('pharmacist'),
  addProductValidator,
  validate,
  pharmacyController.addProductToPharmacy
);

router.get(
  '/pharmacies/nearby',
  nearbyPharmaciesValidator,
  validate,
  pharmacyController.findNearbyPharmacies
);

router.post(
  '/pharmacies/products',
  isAuthenticated,
  hasRole('pharmacist'),
  createProductValidator,
  validate,
  pharmacyController.createProduct
);

router.get(
  '/pharmacies/cart/names',
  isAuthenticated,
  pharmacyController.getPharmacyNamefromcart
);

module.exports = router;