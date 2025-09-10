const { body, param, query } = require('express-validator');

const productValidator = [
  body('name')
    .notEmpty().withMessage('Product name is required')
    .trim(),

  body('type')
    .notEmpty().withMessage('Product type is required')
    .isIn(['Medicine', 'Medical Supply', 'Personal Care', 'Vitamin', 'Other'])
    .withMessage('Invalid product type'),

  

  body('price')
    .isNumeric().withMessage('Price must be a number')
    .isFloat({ min: 0 }).withMessage('Price cannot be negative'),

  body('imageUrl')
    .notEmpty().withMessage('Image URL is required')
    .isURL().withMessage('Invalid URL format')
];

const productIdValidator = [
  param('id')
    .isMongoId().withMessage('Invalid product ID format')
];

const productSearchValidator = [
  query('name')
    .optional()
    .trim()
    .isLength({ min: 3 }).withMessage('Search query must be at least 3 characters')
];

module.exports = { productValidator, productIdValidator, productSearchValidator };
