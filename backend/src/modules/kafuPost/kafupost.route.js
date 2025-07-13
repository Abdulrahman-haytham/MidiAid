const express = require('express');
const { validationResult } = require('express-validator');
const router = express.Router();
const kafuPostsController = require('./kafupost.controller');
const isAuthenticated = require('../../core/middlewares/isAuthenticated');
const kafuPostValidator = require('./kafuPost.validator');

const validate = require('../../core/middlewares/validate'); // استيراد الدالة
router.post('/', isAuthenticated, kafuPostsController.createPost);
router.get('/', kafuPostsController.getAllPosts);
router.get('/nearby', kafuPostsController.getNearbyPosts);
router.put('/help/:postId', isAuthenticated, kafuPostsController.acceptRequest);
router.put('/complete/:postId', isAuthenticated, kafuPostsController.completeRequest);
router.delete('/:postId', isAuthenticated, kafuPostsController.deletePost);

module.exports = router;
