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

  body('location')
    .notEmpty().withMessage('Location is required')
    .isObject().withMessage('Location must be an object')
    .custom((location) => {
      if (!location.coordinates || location.coordinates.length !== 2) {
        throw new Error('Location coordinates must be an array with exactly two values [longitude, latitude]');
      }
      const [longitude, latitude] = location.coordinates;
      if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) {
        throw new Error('Invalid coordinates. Longitude must be between -180 and 180, and latitude must be between -90 and 90.');
      }
      return true;
    }),

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
