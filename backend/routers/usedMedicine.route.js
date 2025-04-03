const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const usedMedicinesController = require('../controllers/usedMedicine.controller');
const isAuthenticated = require('../middlewares/isAuthenticated');
const { usedMedicineValidator, medicineIdValidator } = require('../middlewares/validators/usedMedicines.validator');
const validate = require('../middlewares/validate'); // استيراد الدالة

// إضافة دواء إلى قائمة الأدوية المستعملة
router.post('/add', isAuthenticated, usedMedicineValidator, validate, usedMedicinesController.addMedicine);

// جلب جميع الأدوية المستعملة
router.get('/', isAuthenticated, usedMedicinesController.getMedicines);

// تحديث دواء في قائمة الأدوية المستعملة
router.put('/update/:id', isAuthenticated, medicineIdValidator, usedMedicineValidator, validate, usedMedicinesController.updateMedicine);

// حذف دواء من قائمة الأدوية المستعملة
router.delete('/delete/:id', isAuthenticated, medicineIdValidator, validate, usedMedicinesController.deleteMedicine);

module.exports = router;
