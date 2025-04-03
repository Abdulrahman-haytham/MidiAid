const express = require('express');
const { validationResult } = require('express-validator');
const router = express.Router();
const kafuPostsController = require('../controllers/kafuPost.controller');
const isAuthenticated = require('../middlewares/isAuthenticated');
const kafuPostValidator = require('../middlewares/validators/kafuPost.validator');

const validate = require('../middlewares/validate'); // استيراد الدالة
// مسارات منشورات Kafu

// إنشاء منشور جديد
router.post('/', isAuthenticated, kafuPostsController.createPost);

// جلب جميع منشورات Kafu المفتوحة
router.get('/', kafuPostsController.getAllPosts);

// جلب منشورات Kafu القريبة من موقع المستخدم
router.get('/nearby', kafuPostsController.getNearbyPosts);

// قبول طلب Kafu (عرض المساعدة)
router.put('/help/:postId', isAuthenticated, kafuPostsController.acceptRequest);

// تحديد طلب Kafu كمكتمل
router.put('/complete/:postId', isAuthenticated, kafuPostsController.completeRequest);

// حذف منشور Kafu (فقط المالك أو المشرف يمكنه الحذف)
router.delete('/:postId', isAuthenticated, kafuPostsController.deletePost);

module.exports = router;
