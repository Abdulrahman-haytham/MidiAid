const { body, param } = require('express-validator');

const orderValidator = [
  // التحقق من userId و pharmacyId يجب أن يكونا ObjectId صحيحين
//   body('userId')
//     .isMongoId().withMessage('Invalid user ID format'),

//   body('pharmacyId')
//     .isMongoId().withMessage('Invalid pharmacy ID format'),



  body('orderType')
    .isIn(['delivery', 'reservation']).withMessage('Invalid order type. Allowed values are delivery and reservation'),

//   // التحقق من عنوان التسليم (مطلوب فقط إذا كان نوع الطلب "delivery")
//   body('deliveryAddress')
//     .optional()
//     .notEmpty().withMessage('Delivery address is required for delivery orders')
//     .if(body('orderType').equals('delivery')),

//   // التحقق من حالة الطلب
//   body('status')
//     .optional()
//     .isIn(['pending', 'accepted', 'rejected', 'preparing', 'in_delivery', 'delivered', 'canceled'])
//     .withMessage('Invalid order status'),

//   // التحقق من التقييم
//   body('rating')
//     .optional()
//     .isObject().withMessage('Rating should be an object')
//     .custom((rating) => {
//       if (rating.score && (rating.score < 1 || rating.score > 5)) {
//         throw new Error('Rating score must be between 1 and 5');
//       }
//       return true;
//     }),

//   // التحقق من وجود التواريخ (إن كانت موجودة)
//   body('totalPrice')
//     .isFloat({ gt: 0 }).withMessage('Total price must be greater than 0')
];

const orderIdValidator = [
  param('orderId')
    .isMongoId().withMessage('Invalid order ID format')
];

module.exports = { orderValidator, orderIdValidator };
