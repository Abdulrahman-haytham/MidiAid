const { body, param, query } = require('express-validator');

const pharmacyValidator = [
  // التحقق من أن اسم الصيدلية ليس فارغاً
  body('name')
    .notEmpty().withMessage('Pharmacy name is required')
    .trim(),

  // التحقق من أن عنوان الصيدلية ليس فارغاً
  body('address')
    .notEmpty().withMessage('Address is required')
    .trim(),

  // التحقق من أن إحداثيات الموقع هي مصفوفة تحتوي على 2 قيم (الطول والعرض)
  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('Location coordinates are required [longitude, latitude]')
    .custom((coordinates) => {
      if (coordinates[0] < -180 || coordinates[0] > 180 || coordinates[1] < -90 || coordinates[1] > 90) {
        throw new Error('Coordinates must be valid longitude and latitude values');
      }
      return true;
    }),

  // التحقق من رقم الهاتف (يجب أن يكون رقم غير فارغ)
  body('phone')
    .notEmpty().withMessage('Phone number is required')
    .trim(),

  // التحقق من ساعات العمل (يجب أن تكون غير فارغة)
  body('openingHours')
    .notEmpty().withMessage('Opening hours are required')
    .trim(),

  // التحقق من أن رابط الصورة غير فارغ
  body('imageUrl')
    .notEmpty().withMessage('Image URL is required')
    .trim(),
];

const pharmacyIdValidator = [
  param('id')
    .isMongoId().withMessage('Invalid pharmacy ID format')
];

const pharmacyRateValidator = [
  param('id')
    .isMongoId().withMessage('Invalid pharmacy ID format'),
  body('rating')
    .isInt({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
];

module.exports = { pharmacyValidator, pharmacyIdValidator, pharmacyRateValidator };
