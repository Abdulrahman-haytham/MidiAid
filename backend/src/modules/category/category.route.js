const express = require('express');
const { validationResult } = require('express-validator');
const router = express.Router();
const categoryController = require('../category/category.controller');
const isAuthenticated = require('../../core/middlewares/isAuthenticated');
const hasRole = require('../../core/middlewares/hasRole');
const categoryValidator = require('./category.validator'); 

const validate = require('../../core/middlewares/validate'); 

router.post('/create', isAuthenticated, hasRole('admin'), categoryValidator, validate, categoryController.createCategory);
router.put('/update/:id', isAuthenticated, hasRole('admin'), categoryValidator, validate, categoryController.updateCategory);
router.get('/all', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.get('/search/:name', categoryController.searchCategory);
router.delete('/delete/:id', isAuthenticated, hasRole('admin'), categoryController.deleteCategoryById);
router.delete('/delete-by-name/:name', isAuthenticated, hasRole('admin'), categoryController.deleteCategoryByName);
router.get('/getProductsByCategory/:categoryId', categoryController.getProductsByCategory);

module.exports = router;
