const Cart = require('../models/Cart'); // استيراد نموذج سلة التسوق
const mongoose=require('mongoose')
const Pharmacy=require('../models/Pharmacy')
const Product=require('../models/Product')
// إضافة منتج إلى السلة
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity, pharmacyId } = req.body;
    const userId = req.user.id;

    // Validate input data
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: 'معرف المنتج غير صالح.' });
    }

    if (!mongoose.Types.ObjectId.isValid(pharmacyId)) {
      return res.status(400).json({ error: 'معرف الصيدلية غير صالح.' });
    }

    if (quantity <= 0) {
      return res.status(400).json({ error: 'الكمية يجب أن تكون أكبر من الصفر.' });
    }

    // Check product availability in the pharmacy
    const pharmacy = await Pharmacy.findOne({
      _id: pharmacyId,
      'medicines.medicineId': productId,
      'medicines.quantity': { $gte: quantity },
    });

    if (!pharmacy) {
      return res.status(404).json({
        error: 'المنتج غير متوفر في هذه الصيدلية أو الكمية غير كافية.',
      });
    }

    // Fetch the product name from the Product model
    const product = await Product.findById(productId).select('name');
    if (!product) {
      return res.status(404).json({ error: 'المنتج غير موجود.' });
    }

    // Manage the cart
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItem = cart.items.find(
      (item) =>
        item.productId.toString() === productId &&
        item.pharmacyId.toString() === pharmacyId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        productId,
        quantity,
        pharmacyId,
        productName: product.name,
      });
    }

    cart.updatedAt = Date.now();
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'تمت إضافة المنتج إلى السلة بنجاح.',
      cart: {
        items: cart.items,
        totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      },
    });
  } catch (error) {
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
