const express = require('express');
const router = express.Router();
const kafuPostsController = require('./kafupost.controller');
const isAuthenticated = require('../../core/middlewares/isAuthenticated');
const kafuPostValidator = require('./kafupost.validator');
const validate = require('../../core/middlewares/validate');

router.post('/', isAuthenticated, kafuPostValidator, validate, kafuPostsController.createPost);

router.get('/', kafuPostsController.getAllPosts);

router.get('/by-area', kafuPostsController.getPostsByArea);

router.put('/help/:postId', isAuthenticated, kafuPostsController.acceptRequest);

router.put('/complete/:postId', isAuthenticated, kafuPostsController.completeRequest);

router.delete('/:postId', isAuthenticated, kafuPostsController.deletePost);

module.exports = router;
