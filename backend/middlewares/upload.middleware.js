const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads'); // التأكد من أن المجلد في المسار الصحيح

// ✅ إنشاء مجلد `uploads` تلقائيًا إذا لم يكن موجودًا
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const image = `${Math.floor(Math.random() * 10000)}_${Date.now()}${path.extname(file.originalname)}`;
        cb(null, image);
    }
});

const upload = multer({ storage });

module.exports = upload;
