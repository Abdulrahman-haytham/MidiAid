const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller'); // استيراد وحدة التحكم الخاصة بالرفع

// POST route for file upload
router.post('/', uploadController.uploadFile);

module.exports = router;
