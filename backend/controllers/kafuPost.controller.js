const KafuPost = require('../models/KafuPost');

// Create a new Kafu post
exports.createPost = async (req, res) => {
  try {
    const { title, description, type, medicineId, pharmacyId, location, expiresInDays } = req.body;
    const expiresAt = new Date(Date.now() + (expiresInDays || 3) * 24 * 60 * 60 * 1000);
    const newPost = new KafuPost({ userId: req.user.id, title, description, type, medicineId, pharmacyId, location, expiresAt });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all open Kafu posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await KafuPost.find({ status: 'Open' }).populate('userId', 'name').select('-__v');
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Kafu posts near a user's location
exports.getNearbyPosts = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    const posts = await KafuPost.find({
      location: { $near: { $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] }, $maxDistance: 5000 } },
      status: 'Open'
    }).populate('userId', 'name');
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Accept a Kafu request
exports.acceptRequest = async (req, res) => {
  try {
    const post = await KafuPost.findById(req.params.postId);
    if (!post || post.status !== 'Open') return res.status(400).json({ error: 'Request not available' });
    post.helperId = req.user.id;
    post.status = 'In Progress';
    await post.save();
    res.status(200).json({ message: 'You are now helping with this request.', post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mark a Kafu request as completed
exports.completeRequest = async (req, res) => {
  try {
    const post = await KafuPost.findById(req.params.postId);
    if (!post || post.status !== 'In Progress' || post.helperId.toString() !== req.user.id) return res.status(400).json({ error: 'Invalid request completion' });
    post.status = 'Completed';
    await post.save();
    res.status(200).json({ message: 'Request marked as completed.', post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a Kafu post
exports.deletePost = async (req, res) => {
  try {
    const post = await KafuPost.findById(req.params.postId);
    if (!post || (post.userId.toString() !== req.user.id && req.user.role !== 'admin')) return res.status(403).json({ error: 'Unauthorized' });
    await post.deleteOne();
    res.status(200).json({ message: 'Request deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Automatically delete expired Kafu posts every 24 hours
setInterval(async () => {
  await KafuPost.deleteMany({ expiresAt: { $lt: new Date() }, status: 'Open' });
}, 24 * 60 * 60 * 1000);
