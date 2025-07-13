const express = require('express');
const router = express.Router();
const uploadController = require('./upload.controller'); // استيراد وحدة التحكم الخاصة بالرفع
const upload=require('./upload.middleware')
// POST route for file upload
router.post('/', upload.single('file'), uploadController.uploadFile);

module.exports = router;
