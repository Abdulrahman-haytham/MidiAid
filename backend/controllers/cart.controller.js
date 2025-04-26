const Cart = require('../models/Cart'); // استيراد نموذج سلة التسوق

// إضافة منتج إلى السلة
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity, pharmacyId } = req.body;
    const userId = req.user.id;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId && item.pharmacyId.toString() === pharmacyId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity, pharmacyId });
    }

    cart.updatedAt = Date.now();
    await cart.save();

    res.status(200).json({ message: 'Product added to cart successfully', cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// جلب سلة المستخدم
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });

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
    const productId = req.params.productId;

    const cart = await Cart.findOne({ userId });

    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    const item = cart.items.find((item) => item.productId.toString() === productId);

    if (!item) return res.status(404).json({ error: 'Product not found in cart' });

    if (quantity > 0) {
      item.quantity = quantity;
    } else {
      cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
    }

    cart.updatedAt = Date.now();
    await cart.save();

    res.status(200).json({ message: 'Cart updated successfully', cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// إزالة منتج من السلة
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;

    const cart = await Cart.findOne({ userId });

    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    cart.items = cart.items.filter((item) => item.productId.toString() !== productId);

    cart.updatedAt = Date.now();
    await cart.save();

    res.status(200).json({ message: 'Product removed from cart', cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// تفريغ السلة بالكامل
exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ userId: req.user.id });
    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
