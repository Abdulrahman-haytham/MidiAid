const slugify = require('slugify');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Pharmacy = require('../models/Pharmacy');

exports.createOrder = async (req, res) => {
  try {
    const { pharmacyName, orderType, deliveryAddress } = req.body;
    const pharmacySlug = slugify(pharmacyName, { lower: true, strict: true });
    const pharmacy = await Pharmacy.findOne({ slug: pharmacySlug });

    if (!pharmacy) return res.status(404).json({ error: 'Pharmacy not found' });

    const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
    if (!cart || cart.items.length === 0) return res.status(400).json({ error: 'Cart is empty' });

    if (orderType === 'delivery' && !deliveryAddress) {
      return res.status(400).json({ error: 'Delivery address is required' });
    }

    const items = cart.items.filter((item) => item.pharmacyId.toString() === pharmacy._id.toString());
    if (items.length === 0) return res.status(400).json({ error: 'No items from this pharmacy' });

    const totalPrice = items.reduce((sum, item) => sum + item.quantity * (item.productId?.price || 0), 0);

    const order = new Order({
      userId: req.user.id,
      pharmacyId: pharmacy._id,
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
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const validStatuses = ['accepted', 'rejected', 'preparing', 'in_delivery', 'delivered', 'canceled'];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status update' });

    if (req.user.role === 'user' && status === 'canceled') {
      if (order.status !== 'pending') return res.status(400).json({ error: 'You can only cancel pending orders' });
      order.status = 'canceled';
    } else if (req.user.role === 'pharmacist') {
      if (['accepted', 'rejected'].includes(status) && order.status !== 'pending') {
        return res.status(400).json({ error: 'Order cannot be updated at this stage' });
      }
      if (['preparing', 'in_delivery', 'delivered'].includes(status) && !['accepted', 'preparing', 'in_delivery'].includes(order.status)) {
        return res.status(400).json({ error: 'Order must be accepted first' });
      }
      if (status === 'canceled' && ['preparing', 'in_delivery', 'delivered'].includes(order.status)) {
        return res.status(400).json({ error: 'Cannot cancel order at this stage' });
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
};

exports.getPharmacyOrders = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ userId: req.user.id });
    if (!pharmacy) return res.status(403).json({ error: 'Unauthorized access' });

    const orders = await Order.find({ pharmacyId: pharmacy._id })
      .populate('userId', 'name phone')
      .populate('items.productId', 'name price');

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

  exports.getUserOrders = async (req, res) => {
    try {
      const orders = await Order.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .populate({
          path: 'pharmacyId',
          select: 'name', // منجيب بس اسم الصيدلية
        });
  
      // بنرجع المعلومات المختصرة بس
      const simplifiedOrders = orders.map(order => ({
        orderId: order._id,
        pharmacyId: order.pharmacyId?._id,
        pharmacyName: order.pharmacyId?.name,
        status: order.status,
        orderType: order.orderType,
        createdAt: order.createdAt,
        totalPrice: order.totalPrice,
      }));
  
      res.status(200).json(simplifiedOrders);
    } catch (error) {
      console.error('Error fetching user orders:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء جلب الطلبات' });
    }
  };
exports.getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('userId', 'name phone')
      .populate('items.productId', 'name price description')
      .populate('pharmacyId', 'userId');

    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.rateOrder = async (req, res) => {
    try {
      const { rating, comment } = req.body;
  
      // التأكد من صحة التقييم
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }
  
      // جلب الطلب من قاعدة البيانات مع معلومات الصيدلية (اختياري)
      const order = await Order.findById(req.params.orderId).populate('pharmacyId', 'name');
  
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
  
      // التحقق من أن المستخدم هو صاحب الطلب
      if (order.userId.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized to rate this order' });
      }
  
      // السماح فقط بتقييم الطلبات التي تم تسليمها
      if (order.status !== 'delivered') {
        return res.status(400).json({ error: 'You can only rate delivered orders' });
      }
  
      // التحقق مما إذا كان الطلب قد تم تقييمه مسبقًا
      if (order.rating && order.rating.score) {
        return res.status(400).json({ error: 'Order has already been rated' });
      }
  
      // إضافة التقييم إلى الطلب
      order.rating = { score: rating, comment };
      await order.save();
  
      res.status(200).json({
        message: 'Order rated successfully',
        rating: order.rating,
        pharmacy: order.pharmacyId?.name || 'Unknown Pharmacy', // معلومات إضافية
      });
  
    } catch (error) {
      console.error('Error rating order:', error);
      res.status(500).json({ error: 'Server error while rating order', details: error.message });
    }
  };
  