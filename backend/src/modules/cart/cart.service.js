// src/modules/cart/cart.service.js

const Cart = require('./Cart.model');
const mongoose = require('mongoose');
const Pharmacy = require('../pharmacy/Pharmacy.model');
const Product = require('../product/Product.model'); 
const cartService = {
  
  
  async addProductToCart(userId, itemData) {
    const { productId, quantity, pharmacyId } = itemData;

    if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(pharmacyId) || quantity <= 0) {
      // سيتم التعامل مع هذا الخطأ في الكونترولر أو يمكن تحويله إلى AppError
      throw new Error('بيانات الإدخال غير صالحة.');
    }

    const pharmacy = await Pharmacy.findOne({
      _id: pharmacyId,
      'medicines.medicineId': productId,
      'medicines.quantity': { $gte: quantity },
    });

    if (!pharmacy) {
      throw new Error('المنتج غير متوفر في هذه الصيدلية أو الكمية غير كافية.');
    }

    const product = await Product.findById(productId).select('name');
    if (!product) {
      throw new Error('المنتج غير موجود.');
    }

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
    return cart;
  },

  /**
   * يجلب سلة التسوق الخاصة بالمستخدم.
   * @param {string} userId - معرّف المستخدم.
   * @returns {Promise<object|null>} - كائن السلة أو null.
   */
  async getUserCart(userId) {
    return await Cart.findOne({ userId });
  },

  /**
   * يحدّث كمية منتج في السلة.
   * @param {string} userId - معرّف المستخدم.
   * @param {string} productId - معرّف المنتج.
   * @param {number} quantity - الكمية الجديدة.
   * @returns {Promise<object>} - كائن السلة المحدث.
   */
  async updateItemQuantity(userId, productId, quantity) {
    const cart = await Cart.findOne({ userId });
    if (!cart) throw new Error('Cart not found');

    const item = cart.items.find((item) => item.productId.toString() === productId);
    if (!item) throw new Error('Product not found in cart');

    if (quantity > 0) {
      item.quantity = quantity;
    } else {
      cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
    }

    cart.updatedAt = Date.now();
    await cart.save();
    return cart;
  },

  /**
   * يزيل منتجًا من السلة.
   * @param {string} userId - معرّف المستخدم.
   * @param {string} productId - معرّف المنتج.
   * @returns {Promise<object>} - كائن السلة المحدث.
   */
  async removeItemFromCart(userId, productId) {
    const cart = await Cart.findOne({ userId });
    if (!cart) throw new Error('Cart not found');

    cart.items = cart.items.filter((item) => item.productId.toString() !== productId);

    cart.updatedAt = Date.now();
    await cart.save();
    return cart;
  },

  /**
   * يفرّغ سلة التسوق بالكامل للمستخدم.
   * @param {string} userId - معرّف المستخدم.
   * @returns {Promise<void>}
   */
  async clearUserCart(userId) {
    await Cart.findOneAndDelete({ userId });
  }
};

module.exports = cartService;