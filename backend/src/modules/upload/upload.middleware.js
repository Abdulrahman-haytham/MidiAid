const multer = require('multer');
const { storage } = require('../../core/config/cloudinary');

const upload = multer({ storage: storage }); 

module.exports = upload;