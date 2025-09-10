const express = require('express');
const { validationResult } = require('express-validator');
const router = express.Router();
const cartController = require('./cart.controller'); 
const cartValidator = require('./cart.validator'); 
const isAuthenticated = require('../../core/middlewares/isAuthenticated'); 

const validate = require('../../core/middlewares/validate'); 

router.post('/add', isAuthenticated, cartValidator, validate, cartController.addToCart); 
router.get('/', isAuthenticated, cartController.getCart); 
router.put('/update/:productId', isAuthenticated, cartController.updateCartItem); 
router.delete('/remove/:productId', isAuthenticated, cartController.removeFromCart); 
router.delete('/clear', isAuthenticated, cartController.clearCart); 

module.exports = router;
