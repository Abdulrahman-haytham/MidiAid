const express = require('express');
const { validationResult } = require('express-validator');
const isAuthenticated = require('../../core/middlewares/isAuthenticated');
const hasRole = require('../../core/middlewares/hasRole');
const userController = require('./user.controller');
const userValidator = require('./user.validator'); 
const router = express.Router();

const validate = require('../../core/middlewares/validate');





router.post('/register', ...userValidator.register, validate, userController.register); // ✅
router.post('/verify-email', userController.verifyEmail);
router.post('/logout', isAuthenticated, userController.logout);
router.delete('/users/:id', isAuthenticated, userController.deleteUser);

// router.post('/login', userValidator.login, validate, userController.login);
router.post('/login', ...userValidator.login, validate, userController.login);
router.get('/me', isAuthenticated, userController.getCurrentUser);
router.patch('/updateCurrentUser', isAuthenticated, userController.updateCurrentUser);
router.get('/', isAuthenticated, hasRole('admin'), userController.getAllUsers);
router.put('/users/:id', isAuthenticated, ...userValidator.updateUser, validate, userController.updateUser);router.post('/create-admin', userController.createAdmin);
router.post('/request-password-reset', userController.requestPasswordReset);
router.post('/reset-password', userController.resetPassword);
module.exports = router;
