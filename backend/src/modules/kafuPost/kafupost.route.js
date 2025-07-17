const express = require('express');
const router = express.Router();
const kafuPostsController = require('./kafupost.controller');
const isAuthenticated = require('../../core/middlewares/isAuthenticated');
const kafuPostValidator = require('./kafuPost.validator');
const validate = require('../../core/middlewares/validate');

// Create a new Kafu post (with validation)
router.post('/', isAuthenticated, kafuPostValidator, validate, kafuPostsController.createPost);

// Get all open Kafu posts
router.get('/', kafuPostsController.getAllPosts);

// Get posts by areaName 
router.get('/by-area', kafuPostsController.getPostsByArea);

// Accept a Kafu request
router.put('/help/:postId', isAuthenticated, kafuPostsController.acceptRequest);

// Complete a Kafu request
router.put('/complete/:postId', isAuthenticated, kafuPostsController.completeRequest);

// Delete a post
router.delete('/:postId', isAuthenticated, kafuPostsController.deletePost);

module.exports = router;
