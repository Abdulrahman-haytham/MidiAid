const slugify = require('slugify');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Pharmacy = require('../models/Pharmacy');


exports.createOrder = async (req, res) => {
  try {
    const { pharmacyName, orderType, deliveryAddress } = req.body;

    if (!pharmacyName || !orderType) {
        return res.status(400).json({ error: 'Pharmacy name and order type are required.' });
    }

    if (orderType === 'delivery' && !deliveryAddress) {
      return res.status(400).json({ error: 'Delivery address is required for delivery orders.' });
    }

    const pharmacySlug = slugify(pharmacyName, { lower: true, strict: true });
    const pharmacy = await Pharmacy.findOne({ slug: pharmacySlug });
    if (!pharmacy) {
      return res.status(404).json({ error: `Pharmacy "${pharmacyName}" not found.` });
    }

    const cart = await Cart.findOne({ userId: req.user.id }); 

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty.' });
    }

    const validPharmacyItems = [];
    let totalPrice = 0;

    for (const cartItem of cart.items) {
        if (cartItem.pharmacyId && cartItem.pharmacyId.toString() === pharmacy._id.toString()) {
            const pharmacyMedicine = pharmacy.medicines.find(med =>
                med._id && med._id.toString() === cartItem.productId.toString()
            );

            if (pharmacyMedicine) {
                const itemPrice = pharmacyMedicine.price || 0;
                const quantity = cartItem.quantity || 0; // الكمية من السلة
                const itemTotalPrice = quantity * itemPrice;

                validPharmacyItems.push({
                    cartItemId: cartItem._id, 
                    productId: cartItem.productId, 
                    quantity: quantity,
                    pharmacyId: cartItem.pharmacyId,
                    price: itemPrice, // سعر الدواء في هذه الصيدلية
                });
                totalPrice += itemTotalPrice; // إضافة سعر العنصر إلى المجموع الكلي
            }
        }
    }

    if (validPharmacyItems.length === 0) {
      return res.status(400).json({ error: `No valid items from ${pharmacyName} found in your cart to create an order.` });
    }

    const orderItemsData = validPharmacyItems.map(item => ({
      productId: item.productId,

      quantity: item.quantity,
      pharmacyId: item.pharmacyId,
      // priceAtOrder: item.price
    }));

    const order = new Order({
      userId: req.user.id,
      pharmacyId: pharmacy._id,
      items: orderItemsData, // استخدم البيانات المجهزة
      orderType,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : null,
      totalPrice: totalPrice, // استخدم المجموع المحسوب
      status: 'pending',
    });

    await order.save();

    const orderedCartItemIds = validPharmacyItems.map(item => item.cartItemId.toString());
     cart.items = cart.items.filter(item =>
         !orderedCartItemIds.includes(item._id.toString()) 
     );
    
    await cart.save();

    res.status(201).json({
      message: 'Order created successfully.',
      order: {
          _id: order._id,
          userId: order.userId,
          pharmacyId: order.pharmacyId,
          items: order.items,
          orderType: order.orderType,
          deliveryAddress: order.deliveryAddress,
          totalPrice: order.totalPrice,
          status: order.status,
          createdAt: order.createdAt,
      }
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order.', details: error.message });
  }
};
exports.updateOrderStatus = async (req, res) => {

  try {
     const { status } = req.body;
     const order = await Order.findById(req.params.orderId);
     if (!order) {
      return res.status(404).json({ error: 'Order not found' });
     }

     const validStatuses = ['accepted', 'rejected', 'preparing', 'in_delivery', 'delivered', 'canceled'];
     if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status update' });
     }
     // تحقق من دور المستخدم
     if (req.user.type === 'user') {
      // المستخدم العادي فقط يمكنه إلغاء طلب قيد الانتظار
      if (status === 'canceled') {
        if (order.status !== 'pending') {
          return res.status(400).json({ error: 'You can only cancel pending orders' });
        }
        order.status = 'canceled';
      } else {
        return res.status(403).json({ error: 'Users can only cancel their pending orders' });
      }
     } 
     else if (req.user.type === 'pharmacist') {
      // الصيدلي يمكنه قبول، رفض، تحضير، توصيل وتسليم الطلبات
      if (['accepted', 'rejected'].includes(status)) {
        if (order.status !== 'pending') {
          return res.status(400).json({ error: 'Order cannot be accepted or rejected at this stage' });
        }
        order.status = status;
      } 
      else if (['preparing', 'in_delivery', 'delivered'].includes(status)) {
        if (!['accepted', 'preparing', 'in_delivery'].includes(order.status)) {
          return res.status(400).json({ error: 'Order must be accepted first before moving to the next stages' });
        }
        order.status = status;
      } 
      else if (status === 'canceled') {
        if (['preparing', 'in_delivery', 'delivered'].includes(order.status)) {
          return res.status(400).json({ error: 'Cannot cancel order at this stage' });
        }
        order.status = 'canceled';
      }
      else {
        return res.status(400).json({ error: 'Invalid status change by pharmacist' });
      }
     } 
     else {
      // إذا الدور مو user أو pharmacist
      return res.status(403).json({ error: 'Unauthorized type to update this order' });
    }

    // حفظ التعديلات
    await order.save();
    res.status(200).json({ message: `Order updated to ${status}`, order });

  } catch (error) {
    console.error('Error updating order status:', error);
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
  