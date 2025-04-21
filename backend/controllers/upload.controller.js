const upload = require('../middlewares/upload.middleware'); // Middleware for handling file uploads

/**
 * @desc    Handle file upload
 * @route   POST /api/upload
 * @access  Public
 */
exports.uploadFile = async (req, res) => {
  try {
    const file = req.file; // Access the uploaded file

    // Check if a file was uploaded
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Replace backslashes with forward slashes for compatibility
    const path = file.path.replace(/\\/g, '/');

    // Return the file path
    return res.status(200).json({ message: "Upload successful", data: path });
  } catch (error) {
    return res.status(500).json({ message: error.message });
    console.log(error)
  }
};
