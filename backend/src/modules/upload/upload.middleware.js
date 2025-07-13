// src/modules/upload/upload.middleware.js
const multer = require('multer');
const { storage } = require('../../core/config/cloudinary'); // استيراد الـ storage من ملف الإعدادات

const upload = multer({ storage: storage }); // استخدم Cloudinary storage بدلاً من diskStorage

module.exports = upload;