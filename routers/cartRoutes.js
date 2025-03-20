const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart'); // Cart model
const isAuthenticated = require('../middlewares/isAuthenticated'); // Middleware to check if user is authenticated
const hasRole = require('../middlewares/hasRole'); // Middleware to check if user has a specific role
const isOwner = require('../middlewares/isOwner'); // Middleware to check if user is the owner

// @desc    Add a product to the cart
// @route   POST /api/cart/add
// @access  Private
router.post('/add', isAuthenticated, async (req, res) => {
  try {
    const { productId, quantity, pharmacyId } = req.body;
    const userId = req.user.id;

    // Find the user's cart
    let cart = await Cart.findOne({ userId });

    // If the cart doesn't exist, create a new one
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Check if the product already exists in the cart
    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId && item.pharmacyId.toString() === pharmacyId
    );

    if (existingItem) {
      // If the product exists, update the quantity
      existingItem.quantity += quantity;
    } else {
      // If the product doesn't exist, add it to the cart
      cart.items.push({ productId, quantity, pharmacyId });
    }

    // Update the cart's updatedAt field
    cart.updatedAt = Date.now();
    await cart.save();

    res.status(200).json({ message: 'Product added to cart successfully', cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Get the user's cart
// @route   GET /api/cart/
// @access  Private
router.get('/', isAuthenticated, async (req, res) => {
  try {
    // Find the user's cart and populate product and pharmacy details
    const cart = await Cart.findOne({ userId: req.user.id })
      .populate('items.productId', 'name price') // Populate product details
      .populate('items.pharmacyId', 'name'); // Populate pharmacy details

    // If the cart is empty, return a message
    if (!cart) {
      return res.status(200).json({ message: 'Cart is empty', items: [] });
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Update the quantity of a product in the cart
// @route   PUT /api/cart/update/:productId
// @access  Private
router.put('/update/:productId', isAuthenticated, async (req, res) => {
  try {
    const { quantity } = req.body;
    const userId = req.user.id;
    const productId = req.params.productId;

    // Find the user's cart
    const cart = await Cart.findOne({ userId });

    // If the cart doesn't exist, return an error
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Find the product in the cart
    const item = cart.items.find((item) => item.productId.toString() === productId);

    // If the product doesn't exist in the cart, return an error
    if (!item) {
      return res.status(404).json({ error: 'Product not found in cart' });
    }

    // Update the product quantity
    if (quantity > 0) {
      item.quantity = quantity;
    } else {
      // If the quantity is 0, remove the product from the cart
      cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
    }

    // Update the cart's updatedAt field
    cart.updatedAt = Date.now();
    await cart.save();

    res.status(200).json({ message: 'Cart updated successfully', cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Remove a product from the cart
// @route   DELETE /api/cart/remove/:productId
// @access  Private
router.delete('/remove/:productId', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;

    // Find the user's cart
    const cart = await Cart.findOne({ userId });

    // If the cart doesn't exist, return an error
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    // Remove the product from the cart
    cart.items = cart.items.filter((item) => item.productId.toString() !== productId);

    // Update the cart's updatedAt field
    cart.updatedAt = Date.now();
    await cart.save();

    res.status(200).json({ message: 'Product removed from cart', cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Clear the user's cart
// @route   DELETE /api/cart/clear
// @access  Private
router.delete('/clear', isAuthenticated, async (req, res) => {
  try {
    // Delete the user's cart
    await Cart.findOneAndDelete({ userId: req.user.id });
    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;