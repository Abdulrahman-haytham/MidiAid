const express = require('express');
const mongoose = require('mongoose');
const Pharmacy = require('../models/Pharmacy'); // Pharmacy model
const Product = require('../models/Product'); // Product model
const User=require('../models/User');

const { check, validationResult } = require('express-validator'); // Validation middleware
const isAuthenticated = require('../middlewares/isAuthenticated'); // Middleware to check if user is authenticated
const hasRole = require('../middlewares/hasRole'); // Middleware to check if user has a specific role
const isOwner = require('../middlewares/isOwner'); // Middleware to check if user is the owner
const router = express.Router();

/**
 * @desc    Create a new pharmacy
 * @route   POST /api/pharmacies
 * @access  Private
 */
router.post(
  '/',
  isAuthenticated,hasRole('pharmacist'),
  [
    check('name').notEmpty().withMessage('Pharmacy name is required'),
    check('address').notEmpty().withMessage('Address is required'),
    check('location.coordinates')
      .isArray({ min: 2, max: 2 })
      .withMessage('Location coordinates are required [longitude, latitude]')
      .custom((value) => {
        if (!Array.isArray(value) || value.length !== 2) {
          throw new Error('Location coordinates must be an array of [longitude, latitude]');
        }
        return true;
      }),
    check('phone').notEmpty().withMessage('Phone number is required'),
    check('openingHours').notEmpty().withMessage('Opening hours are required'),
    check('imageUrl').notEmpty().withMessage('Image URL is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        name,
        address,
        location,
        phone,
        openingHours,
        imageUrl,
        description,
        services,
        socialMedia,
        website,
        medicines,
      } = req.body;

      const pharmacy = new Pharmacy({
        userId: req.user.id,
        name,
        address,
        location: {
          type: 'Point',
          coordinates: location.coordinates,
        },
        phone,
        openingHours,
        imageUrl,
        description,
        services,
        socialMedia,
        website,
        medicines,
      });

      await pharmacy.save();
      res.status(201).json({ message: 'Pharmacy created successfully', pharmacy });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * @desc    Get all pharmacies (without sensitive data)
 * @route   GET /api/pharmacies
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    // Find all active pharmacies and select specific fields
    const pharmacies = await Pharmacy.find({ isActive: true }).select(
      'name address location phone openingHours imageUrl averageRating services'
    );

    res.status(200).json(pharmacies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @desc    Get full pharmacy details (including products and reviews)
 * @route   GET /api/pharmacies/details
 * @access  Private
 */
router.get('/details', isAuthenticated,hasRole('pharmacist'), async (req, res) => {
  try {
    // Find the pharmacy associated with the authenticated user
    const pharmacy = await Pharmacy.findOne({ userId: req.user.id })
      .populate('medicines.medicineId') // Populate product details
      .populate('reviews.userId', 'name'); // Populate user details for reviews

    if (!pharmacy) {
      return res.status(404).json({ error: 'Pharmacy not found' });
    }

    res.status(200).json(pharmacy);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @desc    Add a rating to a pharmacy (without comments)
 * @route   POST /api/pharmacies/:id/rate
 * @access  Private
 */
router.post('/:id/rate',  isAuthenticated,async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    const userId = req.user.id; // Authenticated user

    // Validate the rating
    if (!rating || rating < 0 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 0 and 5' });
    }

    // Find the pharmacy by ID
    const pharmacy = await Pharmacy.findById(id);
    if (!pharmacy) {
      return res.status(404).json({ error: 'Pharmacy not found' });
    }

    // Check if the user has already rated the pharmacy
    const existingReview = pharmacy.reviews.find((r) => r.userId.toString() === userId);
    if (existingReview) {
      return res.status(400).json({ error: 'You have already rated this pharmacy' });
    }

    // Add the rating without a comment
    pharmacy.reviews.push({ userId, rating });
    pharmacy.calculateAverageRating(); // Update the average rating
    await pharmacy.save();

    res.status(201).json({ message: 'Rating added successfully', averageRating: pharmacy.averageRating });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @desc    Add a product to the pharmacy from produte which was created by admin (linked to the authenticated user) 
 * @route   POST /api/pharmacies/add-product
 * @access  Private
 */
router.post('/add-product', isAuthenticated,hasRole('pharmacist'), async (req, res) => {
  const { productId, quantity, price } = req.body;

  // Validate the product ID
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ error: 'Invalid product ID' });
  }

  try {
    // Ensure the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Find the pharmacy associated with the authenticated user
    const pharmacy = await Pharmacy.findOne({ userId: req.user.id });
    if (!pharmacy) {
      return res.status(404).json({ error: 'Pharmacy not found' });
    }

    // Check if the product already exists in the pharmacy
    const existingProduct = pharmacy.medicines.find(
      (p) => p.medicineId.toString() === productId
    );

    if (existingProduct) {
      // Update the quantity and price of the existing product
      existingProduct.quantity += quantity;
      existingProduct.price = price;
    } else {
      // Add the new product to the pharmacy
      pharmacy.medicines.push({ medicineId: productId, quantity, price });
    }

    await pharmacy.save();
    res.status(200).json({ message: 'Product added successfully', pharmacy });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @desc    Find nearby pharmacies based on geolocation
 * @route   GET /api/pharmacies/nearby
 * @access  Public
 */
router.get('/nearby', async (req, res) => {
  const { longitude, latitude, maxDistance = 5000 } = req.query;

  // Validate the coordinates
  if (!longitude || !latitude) {
    return res.status(400).json({ error: 'Longitude and latitude are required' });
  }

  try {
    // Find nearby pharmacies using geolocation
    const nearbyPharmacies = await Pharmacy.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
          $maxDistance: parseInt(maxDistance),
        },
      },
    }).select('name address location phone openingHours imageUrl rating');

    res.status(200).json(nearbyPharmacies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @desc    Create a new product
 * @route   POST /api/pharmacies/create-product
 * @access  Private
 */
router.post('/create-product' ,isAuthenticated, hasRole('pharmacist'), async (req, res) => {
  const { name, type, category, sub_category, brand, description, manufacturer, imageUrl, price } = req.body;

  try {
    // Ensure the user exists
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create a new product
    const newProduct = new Product({
      name,
      type,
      category,
      sub_category,
      brand,
      description,
      manufacturer,
      imageUrl,
      price,
      createdBy: req.user.id,
      isAdminCreated: user.role === 'admin', // Determine if the product is created by an admin or pharmacist
    });

    await newProduct.save();
    res.status(201).json({ message: 'Product created successfully', product: newProduct });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;