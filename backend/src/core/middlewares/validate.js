const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Validation errors:', errors.array());
      }

      return res.status(422).json({
        message: 'خطأ في التحقق من البيانات',
        errors: errors.array().map((err) => ({
          field: err.param,
          message: err.msg,
        })),
      });
    }

    next();
  } catch (error) {
    console.error('Error in validate middleware:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
};

module.exports = validate;