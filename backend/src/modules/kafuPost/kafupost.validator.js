const { body } = require('express-validator');

const kafuPostValidator = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .isLength({ max: 100 }).withMessage('Title must not exceed 100 characters'),

  body('description')
    .notEmpty().withMessage('Description is required')
    .isLength({ max: 1000 }).withMessage('Description must not exceed 1000 characters'),

  body('type')
    .isIn(['Medicine Payment', 'Medicine Delivery']).withMessage('Invalid type. Allowed values are Medicine Payment and Medicine Delivery'),

  body('medicineId')
    .optional()
    .isMongoId().withMessage('Invalid Medicine ID format'),

  body('pharmacyId')
    .optional()
    .isMongoId().withMessage('Invalid Pharmacy ID format'),

  body('areaName')
    .notEmpty().withMessage('Area name is required')
    .isLength({ max: 100 }).withMessage('Area name must not exceed 100 characters'),

  body('expiresAt').optional()
    .notEmpty().withMessage('Expiration date is required')
    .isISO8601().withMessage('Invalid expiration date format')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Expiration date must be in the future');
      }
      return true;
    }),
];

module.exports = kafuPostValidator;
