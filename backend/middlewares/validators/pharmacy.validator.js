const { body, param, query } = require('express-validator');

const createPharmacyValidator = [
  body('name')
    .notEmpty()
    .withMessage('اسم الصيدلية مطلوب')
    .trim(),

  body('address')
    .notEmpty()
    .withMessage('العنوان مطلوب')
    .trim(),

  body('location.coordinates')
    .isArray({ min: 2, max: 2 })
    .withMessage('إحداثيات الموقع مطلوبة [خط الطول، خط العرض]')
    .custom((coordinates) => {
      if (coordinates[0] < -180 || coordinates[0] > 180 || coordinates[1] < -90 || coordinates[1] > 90) {
        throw new Error('يجب أن تكون الإحداثيات قيمًا صالحة لخط الطول وخط العرض');
      }
      return true;
    }),

  body('phone')
    .notEmpty()
    .withMessage('رقم الهاتف مطلوب')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('يجب أن يكون رقم الهاتف صالحًا (مثال: +1234567890)')
    .trim(),

  body('openingHours')
    .isObject()
    .withMessage('يجب أن يكون ساعات العمل كائنًا'),

  body('openingHours.morning.from')
    .notEmpty()
    .withMessage('وقت فتح الصباح مطلوب')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('يجب أن يكون وقت فتح الصباح بصيغة HH:MM')
    .trim(),

  body('openingHours.morning.to')
    .notEmpty()
    .withMessage('وقت إغلاق الصباح مطلوب')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('يجب أن يكون وقت إغلاق الصباح بصيغة HH:MM')
    .trim(),

  body('openingHours.evening.from')
    .notEmpty()
    .withMessage('وقت فتح المساء مطلوب')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('يجب أن يكون وقت فتح المساء بصيغة HH:MM')
    .trim(),

  body('openingHours.evening.to')
    .notEmpty()
    .withMessage('وقت إغلاق المساء مطلوب')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('يجب أن يكون وقت إغلاق المساء بصيغة HH:MM')
    .trim(),

  body('imageUrl')
    .notEmpty()
    .withMessage('رابط الصورة مطلوب')
    .isURL()
    .withMessage('يجب أن يكون رابط الصورة صالحًا (مثال: https://example.com/image.jpg)')
    .trim(),
];

const updatePharmacyValidator = [
  body('name')
    .optional()
    .notEmpty()
    .withMessage('اسم الصيدلية لا يمكن أن يكون فارغًا')
    .trim(),

  body('address')
    .optional()
    .notEmpty()
    .withMessage('العنوان لا يمكن أن يكون فارغًا')
    .trim(),

  body('location.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('إحداثيات الموقع مطلوبة [خط الطول، خط العرض]')
    .custom((coordinates) => {
      if (coordinates[0] < -180 || coordinates[0] > 180 || coordinates[1] < -90 || coordinates[1] > 90) {
        throw new Error('يجب أن تكون الإحداثيات قيمًا صالحة لخط الطول وخط العرض');
      }
      return true;
    }),

  body('phone')
    .optional()
    .notEmpty()
    .withMessage('رقم الهاتف لا يمكن أن يكون فارغًا')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('يجب أن يكون رقم الهاتف صالحًا (مثال: +1234567890)')
    .trim(),

  body('openingHours')
    .optional()
    .isObject()
    .withMessage('يجب أن يكون ساعات العمل كائنًا'),

  body('openingHours.morning.from')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('يجب أن يكون وقت فتح الصباح بصيغة HH:MM')
    .trim(),

  body('openingHours.morning.to')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('يجب أن يكون وقت إغلاق الصباح بصيغة HH:MM')
    .trim(),

  body('openingHours.evening.from')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('يجب أن يكون وقت فتح المساء بصيغة HH:MM')
    .trim(),

  body('openingHours.evening.to')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('يجب أن يكون وقت إغلاق المساء بصيغة HH:MM')
    .trim(),

  body('imageUrl')
    .optional()
    .notEmpty()
    .withMessage('رابط الصورة لا يمكن أن يكون فارغًا')
    .isURL()
    .withMessage('يجب أن يكون رابط الصورة صالحًا (مثال: https://example.com/image.jpg)')
    .trim(),
];

const pharmacyIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('تنسيق معرف الصيدلية غير صالح'),
];

const pharmacyRateValidator = [
  param('id')
    .isMongoId()
    .withMessage('تنسيق معرف الصيدلية غير صالح'),
  body('rating')
    .isInt({ min: 0, max: 5 })
    .withMessage('يجب أن يكون التقييم بين 0 و5'),
];

const searchMedicineValidator = [
  param('pharmacyId')
    .isMongoId()
    .withMessage('تنسيق معرف الصيدلية غير صالح'),
  query('name')
    .notEmpty()
    .withMessage('اسم الدواء مطلوب')
    .isLength({ min: 2 })
    .withMessage('يجب أن يحتوي اسم الدواء على حرفين على الأقل')
    .trim()
    .escape(),
];

const nearbyPharmaciesValidator = [
  query('longitude')
    .notEmpty()
    .withMessage('خط الطول مطلوب')
    .isFloat({ min: -180, max: 180 })
    .withMessage('يجب أن يكون خط الطول بين -180 و180')
    .toFloat(),
  query('latitude')
    .notEmpty()
    .withMessage('خط العرض مطلوب')
    .isFloat({ min: -90, max: 90 })
    .withMessage('يجب أن يكون خط العرض بين -90 و90')
    .toFloat(),
  query('maxDistance')
    .optional()
    .isInt({ min: 1 })
    .withMessage('يجب أن تكون المسافة القصوى عددًا صحيحًا إيجابيًا')
    .toInt(),
];

const addProductValidator = [
  body('productId')
    .isMongoId()
    .withMessage('تنسيق معرف المنتج غير صالح'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('يجب أن تكون الكمية عددًا صحيحًا إيجابيًا')
    .toInt(),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('يجب أن يكون السعر رقمًا إيجابيًا')
    .toFloat(),
];

const createProductValidator = [
  body('name')
    .notEmpty()
    .withMessage('اسم المنتج مطلوب')
    .trim(),
  body('type')
    .optional()
    .notEmpty()
    .withMessage('نوع المنتج لا يمكن أن يكون فارغًا')
    .trim(),
  body('categoryName')
    .notEmpty()
    .withMessage('اسم الفئة مطلوب')
    .trim(),
  body('sub_category')
    .optional()
    .notEmpty()
    .withMessage('الفئة الفرعية لا يمكن أن تكون فارغة')
    .trim(),
  body('brand')
    .optional()
    .notEmpty()
    .withMessage('العلامة التجارية لا يمكن أن تكون فارغة')
    .trim(),
  body('description')
    .optional()
    .notEmpty()
    .withMessage('الوصف لا يمكن أن يكون فارغًا')
    .trim(),
  body('manufacturer')
    .optional()
    .notEmpty()
    .withMessage('الشركة المصنعة لا يمكن أن تكون فارغة')
    .trim(),
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('يجب أن يكون رابط الصورة صالحًا')
    .trim(),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('يجب أن يكون السعر رقمًا إيجابيًا')
    .toFloat(),
];

module.exports = {
  createPharmacyValidator,
  updatePharmacyValidator,
  pharmacyIdValidator,
  pharmacyRateValidator,
  searchMedicineValidator,
  nearbyPharmaciesValidator,
  addProductValidator,
  createProductValidator,
};