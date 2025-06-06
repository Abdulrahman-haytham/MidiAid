const express = require('express');
const { validationResult } = require('express-validator');
const isAuthenticated = require('../middlewares/isAuthenticated');
const hasRole = require('../middlewares/hasRole');
const authController = require('../controllers/auth.controller');
const userValidator = require('../middlewares/validators/user.validator'); 
const router = express.Router();

const validate = require('../middlewares/validate');


router.post('/register', userValidator.register, validate, authController.register);
router.post('/verify-email', authController.verifyEmail);
router.post('/login', userValidator.login, validate, authController.login);
router.post('/logout', isAuthenticated, authController.logout);
router.get('/me', isAuthenticated, authController.getCurrentUser);
router.patch('/updateCurrentUser', isAuthenticated, authController.updateCurrentUser);
router.get('/', isAuthenticated, hasRole('admin'), authController.getAllUsers);
router.put('/users/:id', isAuthenticated, userValidator.updateUser, validate, authController.updateUser);
router.delete('/users/:id', isAuthenticated, authController.deleteUser);
router.post('/create-admin', authController.createAdmin);
router.post('/request-password-reset', authController.requestPasswordReset);
router.post('/reset-password', authController.resetPassword);
module.exports = router;
