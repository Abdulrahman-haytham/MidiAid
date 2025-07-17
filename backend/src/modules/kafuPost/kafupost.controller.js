// src/modules/kafuPost/kafupost.controller.js

const kafuPostService = require('./kafupost.service');

// Create a new Kafu post
exports.createPost = async (req, res) => {
  try {
    const newPost = await kafuPostService.createNewPost(req.user.id, req.body);
    res.status(201).json(newPost);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all open Kafu posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await kafuPostService.findAllOpenPosts();
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Kafu posts by area
exports.getPostsByArea = async (req, res) => {
  try {
    const { areaName } = req.query;
    if (!areaName) {
      return res.status(400).json({ error: 'areaName is required in query' });
    }
    const posts = await kafuPostService.findPostsByArea(areaName);
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Accept a Kafu request
exports.acceptRequest = async (req, res) => {
  try {
    const post = await kafuPostService.acceptKafuRequest(req.params.postId, req.user.id);
    res.status(200).json({ message: 'You are now helping with this request.', post });
  } catch (error) {
    if (error.message.includes('not available')) {
      return res.status(400).json({ error: 'Request not available' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Mark a Kafu request as completed
exports.completeRequest = async (req, res) => {
  try {
    const post = await kafuPostService.completeKafuRequest(req.params.postId, req.user.id);
    res.status(200).json({ message: 'Request marked as completed.', post });
  } catch (error) {
    if (error.message.includes('Invalid request completion')) {
      return res.status(400).json({ error: 'Invalid request completion' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Delete a Kafu post
exports.deletePost = async (req, res) => {
  try {
    await kafuPostService.deletePostById(req.params.postId, req.user);
    res.status(200).json({ message: 'Request deleted successfully.' });
  } catch (error) {
    if (error.message.includes('Unauthorized')) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    res.status(500).json({ error: error.message });
  }
};
