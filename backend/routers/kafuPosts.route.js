const express = require('express');
const { validationResult } = require('express-validator');
const router = express.Router();
const kafuPostsController = require('../controllers/kafuPost.controller');
const isAuthenticated = require('../middlewares/isAuthenticated');
const kafuPostValidator = require('../middlewares/validators/kafuPost.validator');

const validate = require('../middlewares/validate'); // استيراد الدالة
router.post('/', isAuthenticated, kafuPostsController.createPost);
router.get('/', kafuPostsController.getAllPosts);
router.get('/nearby', kafuPostsController.getNearbyPosts);
router.put('/help/:postId', isAuthenticated, kafuPostsController.acceptRequest);
router.put('/complete/:postId', isAuthenticated, kafuPostsController.completeRequest);
router.delete('/:postId', isAuthenticated, kafuPostsController.deletePost);

module.exports = router;
