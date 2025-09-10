
exports.uploadFile = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

   
    return res.status(200).json({ 
        message: "Upload successful", 
        data: {
            url: file.path, 
            cloudinary_id: file.filename 
        }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error uploading file" });
  }
};