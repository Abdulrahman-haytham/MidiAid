const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const usedMedicinesController = require('./usedmedicine.controller');
const isAuthenticated = require('../../core/middlewares/isAuthenticated');
const { usedMedicineValidator, medicineIdValidator } = require('./usedmedicine.validator');
const validate = require('../../core/middlewares/validate'); // استيراد الدالة

router.post('/add', isAuthenticated, usedMedicineValidator, validate, usedMedicinesController.addMedicine);
router.get('/', isAuthenticated, usedMedicinesController.getMedicines);
router.put('/update/:id', isAuthenticated, medicineIdValidator, usedMedicineValidator, validate, usedMedicinesController.updateMedicine);
router.delete('/delete/:id', isAuthenticated, medicineIdValidator, validate, usedMedicinesController.deleteMedicine);

module.exports = router;
