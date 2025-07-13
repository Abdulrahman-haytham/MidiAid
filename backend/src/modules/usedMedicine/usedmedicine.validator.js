const { body, param } = require('express-validator');

const usedMedicineValidator = [
  // التحقق من أن المنتج (productId) موجود وصحيح
  body('medicines.*.productId')
    .notEmpty().withMessage('Product ID is required')
    .isMongoId().withMessage('Invalid product ID format'),

  // التحقق من أن الجرعة (dosage) غير فارغة
  body('medicines.*.dosage')
    .notEmpty().withMessage('Dosage is required')
    .trim(),

  // التحقق من أن التكرار (frequency) غير فارغ
  body('medicines.*.frequency')
    .notEmpty().withMessage('Frequency is required')
    .trim(),

  // التحقق من أن تاريخ البداية (startDate) غير فارغ
  body('medicines.*.startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Invalid start date format'),

  // التحقق من أن تاريخ الانتهاء (endDate) إذا تم توفيره يجب أن يكون تاريخًا صالحًا
  body('medicines.*.endDate')
    .optional()
    .isISO8601().withMessage('Invalid end date format'),

  // التحقق من أن وقت التذكير (reminderTime) إذا تم توفيره يجب أن يكون وقتًا صالحًا
  body('medicines.*.reminderTime')
    .optional()
    .isString().withMessage('Reminder time must be a string in HH:MM AM/PM format'),
];

const medicineIdValidator = [
  param('id')
    .isMongoId().withMessage('Invalid medicine ID format'),
];

module.exports = { usedMedicineValidator, medicineIdValidator };
