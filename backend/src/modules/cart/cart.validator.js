const { body, param } = require('express-validator');

const cartValidator = [
  body('productId')
    .notEmpty().withMessage('Product ID is required')
    .isMongoId().withMessage('Invalid Product ID'),
  
  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isInt({ min: 1 }).withMessage('Quantity must be greater than or equal to 1'),

  body('pharmacyId')
    .notEmpty().withMessage('Pharmacy ID is required')
    .isMongoId().withMessage('Invalid Pharmacy ID'),

  

];

module.exports = cartValidator;
