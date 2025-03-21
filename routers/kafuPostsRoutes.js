const express = require('express');
const router = express.Router();
const KafuPost = require('../Models/KafuPost'); // KafuPost model
const isAuthenticated = require('../middlewares/isAuthenticated'); // Middleware to check if user is authenticated
const hasRole = require('../middlewares/hasRole'); // Middleware to check if user has a specific role
const isOwner = require('../middlewares/isOwner'); // Middleware to check if user is the owner

/**
 * @desc    Create a new Kafu post (request for help)
 * @route   POST /api/kafu-posts
 * @access  Private
 */
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { title, description, type, medicineId, pharmacyId, location, expiresInDays } = req.body;

    // Set expiration date (default: 3 days from now)
    const expiresAt = new Date(Date.now() + (expiresInDays || 3) * 24 * 60 * 60 * 1000);

    // Create a new Kafu post
    const newPost = new KafuPost({
      userId: req.user.id,
      title,
      description,
      type,
      medicineId,
      pharmacyId,
      location,
      expiresAt
    });

    // Save the post to the database
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @desc    Get all open Kafu posts
 * @route   GET /api/kafu-posts
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // Find all open posts and populate the user's name
    const posts = await KafuPost.find({ status: 'Open' }).populate('userId', 'name').select('-__v');
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @desc    Get Kafu posts near a user's location
 * @route   GET /api/kafu-posts/nearby
 * @access  Public
 */
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lng } = req.query;

    // Find posts near the provided coordinates within a 5km radius
    const posts = await KafuPost.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: 5000 // Search within a 5km radius
        }
      },
      status: 'Open'
    }).populate('userId', 'name');

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @desc    Accept a Kafu request (offer to help)
 * @route   PUT /api/kafu-posts/help/:postId
 * @access  Private
 */
router.put('/help/:postId', isAuthenticated, async (req, res) => {
  try {
    // Find the post by ID
    const post = await KafuPost.findById(req.params.postId);
    if (!post || post.status !== 'Open') {
      return res.status(400).json({ error: 'Request not available' });
    }

    // Assign the current user as the helper and update the status
    post.helperId = req.user.id;
    post.status = 'In Progress';
    await post.save();

    res.status(200).json({ message: 'You are now helping with this request.', post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @desc    Mark a Kafu request as completed
 * @route   PUT /api/kafu-posts/complete/:postId
 * @access  Private
 */
router.put('/complete/:postId', isAuthenticated, async (req, res) => {
  try {
    // Find the post by ID
    const post = await KafuPost.findById(req.params.postId);

    // Check if the post is valid and the current user is the helper
    if (!post || post.status !== 'In Progress' || post.helperId.toString() !== req.user.id) {
      return res.status(400).json({ error: 'Invalid request completion' });
    }

    // Mark the post as completed
    post.status = 'Completed';
    await post.save();

    res.status(200).json({ message: 'Request marked as completed.', post });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @desc    Delete a Kafu post (only the owner or admin can delete)
 * @route   DELETE /api/kafu-posts/:postId
 * @access  Private
 */
router.delete('/:postId', isAuthenticated, async (req, res) => {
  try {
    // Find the post by ID
    const post = await KafuPost.findById(req.params.postId);

    // Check if the current user is the owner or an admin
    if (!post || (post.userId.toString() !== req.user.id && req.user.role !== 'admin')) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Delete the post
    await post.deleteOne();
    res.status(200).json({ message: 'Request deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @desc    Automatically delete expired Kafu posts (Runs every 24 hours)
 * @access  Private
 */
const deleteExpiredPosts = async () => {
  // Delete all posts that have expired and are still open
  await KafuPost.deleteMany({ expiresAt: { $lt: new Date() }, status: 'Open' });
};

// Run the deleteExpiredPosts function every 24 hours
setInterval(deleteExpiredPosts, 24 * 60 * 60 * 1000);

module.exports = router;