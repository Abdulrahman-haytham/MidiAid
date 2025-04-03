const { body } = require('express-validator');

const register = [
    body('type')
        .isIn(['admin', 'user', 'pharmacist'])
        .withMessage('Invalid user type. Allowed values: admin, user, pharmacist'),

    body('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),

    body('email')
        .trim()
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

    body('phone')
        .trim()
        .notEmpty().withMessage('Phone number is required')
        .matches(/^[0-9+()-]+$/).withMessage('Invalid phone number format'),

    body('address')
        .trim()
        .notEmpty().withMessage('Address is required'),

    body('license')
        .if(body('type').equals('pharmacist'))
        .notEmpty().withMessage('License is required for pharmacists'),
];

const login = [
    body('email')
        .trim()
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required'),
];

const updateUser = [
    body('username')
        .optional()
        .trim()
        .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),

    body('email')
        .optional()
        .trim()
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),

    body('phone')
        .optional()
        .trim()
        .matches(/^[0-9+()-]+$/).withMessage('Invalid phone number format'),

    body('address')
        .optional()
        .trim(),
];

const createAdmin = [
    body('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),

    body('email')
        .trim()
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

module.exports = { register, login, updateUser, createAdmin };
