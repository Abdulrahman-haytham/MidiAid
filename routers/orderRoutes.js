const express = require('express');
const router = express.Router();
const Order = require('../Models/Order');
const Cart = require('../Models/Cart');
const Pharmacy = require('../Models/Pharmacy');
const isAuthenticated = require('../middlewares/isAuthenticated');
const hasRole = require('../middlewares/hasRole');
const isOwner = require('../middlewares/isOwner');

/**
 * @desc    Create a new order
 * @route   POST /api/orders/create
 * @access  Private
 */
router.post('/create', isAuthenticated, async (req, res) => {
  try {
    const { pharmacyId, orderType, deliveryAddress } = req.body;

    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy) {
      return res.status(404).json({ error: 'Pharmacy not found' });
    }

    const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    if (orderType === 'delivery' && !deliveryAddress) {
      return res.status(400).json({ error: 'Delivery address is required for delivery orders' });
    }

    const items = cart.items.filter((item) => item.pharmacyId.toString() === pharmacyId);
    if (items.length === 0) {
      return res.status(400).json({ error: 'No items from this pharmacy' });
    }

    const totalPrice = items.reduce((sum, item) => sum + item.quantity * (item.productId?.price || 0), 0);

    const order = new Order({
      userId: req.user.id,
      pharmacyId,
      items,
      orderType,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : null,
      totalPrice,
      status: 'pending',
    });

    await order.save();
    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @desc    Update order status (accept, reject, preparing, in_delivery, delivered, cancel)
 * @route   PUT /api/orders/:orderId/status
 * @access  Private (User or Pharmacist)
 */
router.put('/:orderId/status', isAuthenticated, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // جميع الحالات المسموحة للتحديث
    const validStatuses = ['accepted', 'rejected', 'preparing', 'in_delivery', 'delivered', 'canceled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status update' });
    }

    // السماح للمستخدم بإلغاء الطلب فقط إذا كان "pending"
    if (req.user.role === 'user' && status === 'canceled') {
      if (order.status !== 'pending') {
        return res.status(400).json({ error: 'You can only cancel pending orders' });
      }
      order.status = 'canceled';
    }

    // السماح للصيدلي بتغيير الحالة (قبول، رفض، تجهيز، إلخ)
    else if (req.user.role === 'pharmacist') {
      // قبول أو رفض الطلب (يجب أن يكون قيد الانتظار)
      if (['accepted', 'rejected'].includes(status)) {
        if (order.status !== 'pending') {
          return res.status(400).json({ error: 'Order cannot be updated at this stage' });
        }
      }
      // تجهيز، توصيل، تسليم (يجب أن يكون الطلب مقبولًا)
      else if (['preparing', 'in_delivery', 'delivered'].includes(status)) {
        if (!['accepted', 'preparing', 'in_delivery'].includes(order.status)) {
          return res.status(400).json({ error: 'Order must be accepted first' });
        }
      }
      // إلغاء الطلب (الصيدلي يستطيع إلغاء الطلب قبل التجهيز)
      else if (status === 'canceled') {
        if (['preparing', 'in_delivery', 'delivered'].includes(order.status)) {
          return res.status(400).json({ error: 'Cannot cancel order at this stage' });
        }
      }
      order.status = status;
    } else {
      return res.status(403).json({ error: 'Unauthorized to update this order' });
    }

    await order.save();
    res.status(200).json({ message: `Order updated to ${status}`, order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



/**
 * @desc    Get orders for a pharmacy (Pharmacy owner only)
 * @route   GET /api/orders/pharmacy-orders
 * @access  Private
 */
router.get('/pharmacy-orders', isAuthenticated, hasRole('pharmacist'), async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ userId: req.user.id });
    if (!pharmacy) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    const orders = await Order.find({ pharmacyId: pharmacy._id })
      .populate('userId', 'name phone')
      .populate('items.productId', 'name price');

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @desc    Get all orders for the authenticated user
 * @route   GET /api/orders/my-orders
 * @access  Private (User)
 */
router.get('/my-orders', isAuthenticated, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
/**
 * @desc    Get order details
 * @route   GET /api/orders/:orderId
 * @access  Private (User or Pharmacist)
 */
router.get('/:orderId', isAuthenticated, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('userId', 'name phone')
      .populate('items.productId', 'name price description')
      .populate('pharmacyId', 'userId'); // لجلب هوية مالك الصيدلية

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    
    

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});






/**
 * @desc    Rate an order after delivery
 * @route   POST /api/orders/rate/:orderId
 * @access  Private (User)
 */
router.post('/rate/:orderId', isAuthenticated, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    // التحقق من صحة التقييم
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // السماح فقط للمستخدم صاحب الطلب بتقييمه
    if (order.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to rate this order' });
    }

    // السماح بالتقييم فقط بعد توصيل الطلب
    if (order.status !== 'delivered') {
      return res.status(400).json({ error: 'You can only rate delivered orders' });
    }

    order.rating = { score: rating, comment };
    await order.save();

    res.status(200).json({ message: 'Order rated successfully', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
