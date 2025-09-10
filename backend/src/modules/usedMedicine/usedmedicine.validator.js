const { body, param } = require('express-validator');

const usedMedicineValidator = [
  body('medicines.*.productId')
    .notEmpty().withMessage('Product ID is required')
    .isMongoId().withMessage('Invalid product ID format'),

  body('medicines.*.dosage')
    .notEmpty().withMessage('Dosage is required')
    .trim(),

  body('medicines.*.frequency')
    .notEmpty().withMessage('Frequency is required')
    .trim(),

  body('medicines.*.startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Invalid start date format'),

  body('medicines.*.endDate')
    .optional()
    .isISO8601().withMessage('Invalid end date format'),

  body('medicines.*.reminderTime')
    .optional()
    .isString().withMessage('Reminder time must be a string in HH:MM AM/PM format'),
];

const medicineIdValidator = [
  param('id')
    .isMongoId().withMessage('Invalid medicine ID format'),
];

module.exports = { usedMedicineValidator, medicineIdValidator };
