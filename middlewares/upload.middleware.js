const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads'); // تصحيح الكلمة من 'destinations' إلى 'destination'
    },
    filename: (req, file, cb) => {
        const image = `${Math.floor(Math.random() * 10000)}_${Date.now()}${path.extname(file.originalname)}`;
        cb(null, image);
    }
});

const upload = multer({ storage });

module.exports = upload;
