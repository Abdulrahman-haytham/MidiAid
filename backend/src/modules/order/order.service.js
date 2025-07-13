// src/modules/order/order.service.js

const slugify = require('slugify');
const Order = require('./Order.model');
const Cart = require('../cart/Cart.model');
const Pharmacy = require('../pharmacy/Pharmacy.model');
const Product = require('../product/Product.model');

const orderService = {
  
  /**
   * إنشاء طلب جديد من سلة التسوق.
   * @param {string} userId - معرّف المستخدم.
   * @param {object} orderDetails - تفاصيل الطلب { pharmacyName, orderType, deliveryAddress }.
   * @returns {Promise<object>} - الطلب الذي تم إنشاؤه.
   */
  async createOrderFromCart(userId, orderDetails) {
    const { pharmacyName, orderType, deliveryAddress } = orderDetails;

    if (!pharmacyName || !orderType) {
      throw new Error('Pharmacy name and order type are required.');
    }
    if (orderType === 'delivery' && !deliveryAddress) {
      throw new Error('Delivery address is required for delivery orders.');
    }

    const pharmacySlug = slugify(pharmacyName, { lower: true, strict: true });
    const pharmacy = await Pharmacy.findOne({ slug: pharmacySlug });
    if (!pharmacy) {
      throw new Error(`Pharmacy "${pharmacyName}" not found.`);
    }

    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      throw new Error('Your cart is empty.');
    }

    const validPharmacyItems = [];
    let totalPrice = 0;

    const productIdsToFetch = cart.items
        .filter(item => item.pharmacyId && item.pharmacyId.toString() === pharmacy._id.toString())
        .map(item => item.productId);
    
    const products = await Product.find({ _id: { $in: productIdsToFetch } }).select('name').lean();
    const productMap = products.reduce((map, product) => {
        map[product._id.toString()] = product.name;
        return map;
    }, {});

    for (const cartItem of cart.items) {
        if (cartItem.pharmacyId && cartItem.pharmacyId.toString() === pharmacy._id.toString()) {
            const pharmacyMedicine = pharmacy.medicines.find(med =>
                med.medicineId && med.medicineId.toString() === cartItem.productId.toString()
            );

            if (pharmacyMedicine) {
                const itemPrice = pharmacyMedicine.price || 0;
                const quantity = cartItem.quantity || 0;
                const itemTotalPrice = quantity * itemPrice;
                const itemName = productMap[cartItem.productId.toString()] || 'Unknown Product';

                validPharmacyItems.push({
                    cartItemId: cartItem._id, 
                    productId: cartItem.productId, 
                    quantity: quantity,
                    pharmacyId: cartItem.pharmacyId,
                    price: itemPrice, 
                    name: itemName,
                });
                totalPrice += itemTotalPrice; 
            }
        }
    }
    
    // إعلام: لم أغير أي شيء في console.log
    console.log('Pharmacy ID:', pharmacy._id.toString());
    console.log('Cart Items:', cart.items.map(item => ({ cartItemId: item._id.toString(), productId: item.productId.toString(), pharmacyId: item.pharmacyId.toString(), quantity: item.quantity, name: item.name || 'N/A' })));
    console.log('Pharmacy Medicines:', pharmacy.medicines.map(med => ({ _id: med._id ? med._id.toString() : 'N/A', medicineId: med.medicineId ? med.medicineId.toString() : 'N/A', name: med.name || 'N/A' })));
    console.log('Valid Pharmacy Items:', validPharmacyItems.map(item => ({ cartItemId: item.cartItemId.toString(), productId: item.productId.toString(), pharmacyId: item.pharmacyId.toString(), quantity: item.quantity, price: item.price, name: item.name })));

    if (validPharmacyItems.length === 0) {
      throw new Error(`No valid items from ${pharmacyName} found in your cart to create an order.`);
    }

    const orderItemsData = validPharmacyItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      name: item.name,
    }));

    const order = new Order({
      userId: userId,
      pharmacyId: pharmacy._id, 
      items: orderItemsData,    
      orderType,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : null,
      totalPrice: totalPrice,   
      status: 'pending',        
    });

    await order.save();

    const orderedCartItemIds = validPharmacyItems.map(item => item.cartItemId.toString());
    cart.items = cart.items.filter(item => !orderedCartItemIds.includes(item._id.toString()));
    await cart.save();

    return order;
  },

  /**
   * تحديث حالة الطلب.
   * @param {string} orderId - معرّف الطلب.
   * @param {string} newStatus - الحالة الجديدة.
   * @param {object} user - كائن المستخدم للتحقق من الصلاحيات.
   * @returns {Promise<object>} - الطلب المحدث.
   */
  async updateOrderStatus(orderId, newStatus, user) {
    const order = await Order.findById(orderId);
    if (!order) {
     throw new Error('Order not found');
    }

    const validStatuses = ['accepted', 'rejected', 'preparing', 'in_delivery', 'delivered', 'canceled'];
    if (!validStatuses.includes(newStatus)) {
     throw new Error('Invalid status update');
    }

    if (user.type === 'user') {
      if (newStatus === 'canceled') {
        if (order.status !== 'pending') throw new Error('You can only cancel pending orders');
        order.status = 'canceled';
      } else {
        throw new Error('Users can only cancel their pending orders');
      }
    } else if (user.type === 'pharmacist') {
      if (['accepted', 'rejected'].includes(newStatus)) {
        if (order.status !== 'pending') throw new Error('Order cannot be accepted or rejected at this stage');
        order.status = newStatus;
      } else if (['preparing', 'in_delivery', 'delivered'].includes(newStatus)) {
        if (!['accepted', 'preparing', 'in_delivery'].includes(order.status)) throw new Error('Order must be accepted first before moving to the next stages');
        order.status = newStatus;
      } else if (newStatus === 'canceled') {
        if (['preparing', 'in_delivery', 'delivered'].includes(order.status)) throw new Error('Cannot cancel order at this stage');
        order.status = 'canceled';
      } else {
        throw new Error('Invalid status change by pharmacist');
      }
    } else {
      throw new Error('Unauthorized type to update this order');
    }

    await order.save();
    return order;
  },

  /**
   * جلب طلبات صيدلية معينة.
   * @param {string} userId - معرّف مستخدم الصيدلية.
   * @returns {Promise<Array>} - مصفوفة من الطلبات.
   */
  async findOrdersForPharmacy(userId) {
    const pharmacy = await Pharmacy.findOne({ userId });
    if (!pharmacy) throw new Error('Unauthorized access');

    return await Order.find({ pharmacyId: pharmacy._id })
      .populate('userId', 'name phone')
      .populate('items.productId', 'name price');
  },

  /**
   * جلب طلبات مستخدم معين.
   * @param {string} userId - معرّف المستخدم.
   * @returns {Promise<Array>} - مصفوفة من الطلبات المبسطة.
   */
  async findOrdersForUser(userId) {
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .populate({
        path: 'pharmacyId',
        select: 'name',
      });
    
    return orders.map(order => ({
        orderId: order._id,
        pharmacyId: order.pharmacyId?._id,
        pharmacyName: order.pharmacyId?.name,
        status: order.status,
        orderType: order.orderType,
        createdAt: order.createdAt,
        totalPrice: order.totalPrice,
      }));
  },

  /**
   * جلب تفاصيل طلب معين.
   * @param {string} orderId - معرّف الطلب.
   * @returns {Promise<object|null>} - كائن الطلب أو null.
   */
  async findOrderDetails(orderId) {
    return await Order.findById(orderId)
      .populate('userId', 'name phone')
      .populate('items.productId', 'name price description')
      .populate('pharmacyId', 'userId');
  },

  /**
   * تقييم طلب.
   * @param {string} orderId - معرّف الطلب.
   * @param {string} userId - معرّف المستخدم.
   * @param {object} ratingData - بيانات التقييم { rating, comment }.
   * @returns {Promise<object>} - كائن التقييم.
   */
  async rateExistingOrder(orderId, userId, ratingData) {
    const { rating, comment } = ratingData;
    if (!rating || rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const order = await Order.findById(orderId).populate('pharmacyId', 'name');
    if (!order) throw new Error('Order not found');
    if (order.userId.toString() !== userId) throw new Error('Unauthorized to rate this order');
    if (order.status !== 'delivered') throw new Error('You can only rate delivered orders');
    if (order.rating && order.rating.score) throw new Error('Order has already been rated');

    order.rating = { score: rating, comment };
    await order.save();
    return order;
  }
};

module.exports = orderService;