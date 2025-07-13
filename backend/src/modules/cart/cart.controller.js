// src/modules/cart/cart.controller.js

const cartService = require('./cart.service');
const mongoose = require('mongoose');

// إضافة منتج إلى السلة
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity, pharmacyId } = req.body;
    const userId = req.user.id;

    // ----- Validation Logic that can stay in the controller/validator middleware -----
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: 'معرف المنتج غير صالح.' });
    }
    if (!mongoose.Types.ObjectId.isValid(pharmacyId)) {
      return res.status(400).json({ error: 'معرف الصيدلية غير صالح.' });
    }
    if (quantity <= 0) {
      return res.status(400).json({ error: 'الكمية يجب أن تكون أكبر من الصفر.' });
    }
    // ----- End of Validation -----

    // Call the service to handle business logic
    const cart = await cartService.addProductToCart(userId, { productId, quantity, pharmacyId });

    // Format the response
    res.status(200).json({
      success: true,
      message: 'تمت إضافة المنتج إلى السلة بنجاح.',
      cart: {
        items: cart.items,
        totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      },
    });

  } catch (error) {
    // Distinguish between client errors and server errors
    if (error.message.includes('المنتج غير متوفر') || error.message.includes('المنتج غير موجود')) {
      return res.status(404).json({ error: error.message });
    }
    console.error('Error in addToCart:', error);
    res.status(500).json({
      success: false,
      error: 'حدث خطأ أثناء إضافة المنتج إلى السلة.',
      details: error.message,
    });
  }
};

// جلب سلة المستخدم
exports.getCart = async (req, res) => {
  try {
    const cart = await cartService.getUserCart(req.user.id);
    if (!cart) {
      return res.status(200).json({ message: 'Cart is empty', items: [] });
    }
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// تحديث كمية منتج في السلة
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const userId = req.user.id;
    const { productId } = req.params;

    const cart = await cartService.updateItemQuantity(userId, productId, quantity);
    res.status(200).json({ message: 'Cart updated successfully', cart });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

// إزالة منتج من السلة
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const cart = await cartService.removeItemFromCart(userId, productId);
    res.status(200).json({ message: 'Product removed from cart', cart });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

// تفريغ السلة بالكامل
exports.clearCart = async (req, res) => {
  try {
    await cartService.clearUserCart(req.user.id);
    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};