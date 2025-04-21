const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const isAuthenticated = require('../middlewares/isAuthenticated');
const hasRole = require('../middlewares/hasRole');
const pharmacyController = require('../controllers/pharmacy.controller');
const { pharmacyValidator, pharmacyIdValidator, pharmacyRateValidator } = require('../middlewares/validators/pharmacy.validator');

const validate = require('../middlewares/validate'); // استيراد الدالة
// إنشاء صيدلية جديدة
router.post(
  '/',
  isAuthenticated, hasRole('pharmacist'),
 
  pharmacyController.createPharmacy
);

router.put('/updatePharmacy', isAuthenticated, hasRole('pharmacist'),pharmacyController.updatePharmacy)
// جلب جميع الصيدليات
router.get('/', pharmacyController.getAllPharmacies);

router.get('/getMyPharmacy',isAuthenticated, hasRole('pharmacist'), pharmacyController.getMyPharmacy);
router.get('/getMyPharmacyOrders',isAuthenticated,hasRole('pharmacist'),pharmacyController.getMyPharmacyOrders)
// جلب تفاصيل الصيدلية الكاملة (بما في ذلك المنتجات والتقييمات)
// router.get('/details', isAuthenticated, hasRole('pharmacist'), pharmacyController.getPharmacyDetails);

// إضافة تقييم لصيدلية
router.post('/:id/rate', isAuthenticated, pharmacyRateValidator, validate, pharmacyController.ratePharmacy);

router.get('/getPharmacyDetails/:id',pharmacyController.getPharmacyDetails);
// إضافة منتج إلى الصيدلية
router.post('/add-product', isAuthenticated, hasRole('pharmacist'), pharmacyController.addProductToPharmacy);

// إيجاد الصيدليات القريبة استنادًا إلى الموقع الجغرافي
router.get('/nearby', pharmacyController.findNearbyPharmacies);

// إنشاء منتج جديد
router.post('/create-product', isAuthenticated, hasRole('pharmacist'), pharmacyController.createProduct);

module.exports = router;
