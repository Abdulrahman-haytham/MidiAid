const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller'); // استيراد وحدة التحكم الخاصة بالرفع
const upload=require('../middlewares/upload.middleware')
// POST route for file upload
router.post('/', upload.single('file'), uploadController.uploadFile);

module.exports = router;
