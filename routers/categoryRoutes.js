const express = require('express');
const Category = require('../models/Category'); // Ensure the correct path to the Category model
const slugify = require('slugify'); // Import slugify for automatic slug generation
const isAuthenticated = require('../middlewares/isAuthenticated'); // Middleware to check if user is authenticated
const hasRole = require('../middlewares/hasRole'); // Middleware to check if user has a specific role
const isOwner = require('../middlewares/isOwner'); // Middleware to check if user is the owner
const router = express.Router();

// @desc    Create a new category (Admin only)
// @route   POST /api/categories/create
// @access  Private (Admin)
router.post('/create', isAuthenticated, hasRole('admin'), async (req, res) => {
  try {
    const { name, image } = req.body;

    // Check if the category name is provided
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    // Check if the category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    // Create the category
    const category = new Category({ name, image });
    await category.save();

    res.status(201).json({ message: 'Category created successfully', category });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create category', error: error.message });
  }
});

// @desc    Update a category by ID (Admin only)
// @route   PUT /api/categories/update/:id
// @access  Private (Admin)
router.put('/update/:id', isAuthenticated, hasRole('admin'), async (req, res) => {
  try {
    const { name, image } = req.body;

    // Check if the category exists
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Update the category
    if (name) category.name = name;
    if (image) category.image = image;

    await category.save();

    res.status(200).json({ message: 'Category updated successfully', category });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update category', error: error.message });
  }
});

// @desc    Get all categories
// @route   GET /api/categories/all
// @access  Public
router.get('/all', async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json({ message: 'Categories retrieved successfully', categories });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve categories', error: error.message });
  }
});

// @desc    Get a single category by ID
// @route   GET /api/categories/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json({ message: 'Category retrieved successfully', category });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve category', error: error.message });
  }
});

// @desc    Search for a category by name (automatically converts name to slug)
// @route   GET /api/categories/search/:name
// @access  Public
router.get('/search/:name', async (req, res) => {
  try {
    // Convert the name to a slug
    const slug = slugify(req.params.name, { lower: true });

    // Search using the slug
    const category = await Category.findOne({ slug });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json({ message: 'Category found successfully', category });
  } catch (error) {
    res.status(500).json({ message: 'Failed to search for category', error: error.message });
  }
});

// @desc    Delete a category by ID (Admin only)
// @route   DELETE /api/categories/delete/:id
// @access  Private (Admin)
router.delete('/delete/:id', isAuthenticated, hasRole('admin'), async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json({ message: 'Category deleted successfully', category });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete category', error: error.message });
  }
});

// @desc    Delete a category by name (Admin only)
// @route   DELETE /api/categories/delete-by-name/:name
// @access  Private (Admin)
router.delete('/delete-by-name/:name', isAuthenticated, hasRole('admin'), async (req, res) => {
  try {
    // Convert the name to a slug
    const slug = slugify(req.params.name, { lower: true });

    // Find and delete the category by slug
    const category = await Category.findOneAndDelete({ slug });
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json({ message: 'Category deleted successfully', category });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete category', error: error.message });
  }
});

// Export the router
module.exports = router;