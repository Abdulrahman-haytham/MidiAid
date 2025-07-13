/**
 * @desc    Handle file upload
 * @route   POST /api/upload
 * @access  Public
 */
exports.uploadFile = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // الآن `file.path` هو رابط الصورة على Cloudinary
    // يمكنك حفظ هذا الرابط في قاعدة البيانات الخاصة بك
    return res.status(200).json({ 
        message: "Upload successful", 
        data: {
            url: file.path, // هذا هو الرابط العام للملف
            cloudinary_id: file.filename // هذا هو ID الملف على Cloudinary (مفيد للحذف لاحقاً)
        }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error uploading file" });
  }
};