const { body } = require('express-validator');

const categoryValidator = [
    body('name')
        .notEmpty().withMessage('Category name is required')
        .isLength({ min: 3, max: 32 }).withMessage('Category name must be between 3 and 32 characters long'),

    body('image')
        .optional()  // صورة الفئة اختيارية
        .isString().withMessage('Image URL must be a string')
        .isURL().withMessage('Image URL must be valid'), // التأكد من أن الرابط صالح إذا تم توفيره
];

module.exports = categoryValidator;
