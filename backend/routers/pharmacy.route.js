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

// جلب جميع الصيدليات
router.get('/', pharmacyController.getAllPharmacies);

// جلب تفاصيل الصيدلية الكاملة (بما في ذلك المنتجات والتقييمات)
router.get('/details', isAuthenticated, hasRole('pharmacist'), pharmacyController.getPharmacyDetails);

// إضافة تقييم لصيدلية
router.post('/:id/rate', isAuthenticated, pharmacyRateValidator, validate, pharmacyController.ratePharmacy);

// إضافة منتج إلى الصيدلية
router.post('/add-product', isAuthenticated, hasRole('pharmacist'), pharmacyController.addProductToPharmacy);

// إيجاد الصيدليات القريبة استنادًا إلى الموقع الجغرافي
router.get('/nearby', pharmacyController.findNearbyPharmacies);

// إنشاء منتج جديد
router.post('/create-product', isAuthenticated, hasRole('pharmacist'), pharmacyController.createProduct);

module.exports = router;
