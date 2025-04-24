const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const usedMedicinesController = require('../controllers/usedMedicine.controller');
const isAuthenticated = require('../middlewares/isAuthenticated');
const { usedMedicineValidator, medicineIdValidator } = require('../middlewares/validators/usedMedicines.validator');
const validate = require('../middlewares/validate'); // استيراد الدالة

router.post('/add', isAuthenticated, usedMedicineValidator, validate, usedMedicinesController.addMedicine);
router.get('/', isAuthenticated, usedMedicinesController.getMedicines);
router.put('/update/:id', isAuthenticated, medicineIdValidator, usedMedicineValidator, validate, usedMedicinesController.updateMedicine);
router.delete('/delete/:id', isAuthenticated, medicineIdValidator, validate, usedMedicinesController.deleteMedicine);

module.exports = router;
