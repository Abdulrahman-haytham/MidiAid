const slugify = require('slugify');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Pharmacy = require('../models/Pharmacy');
const Product=require('../models/Product')

exports.createOrder = async (req, res) => {
  try {
    const { pharmacyName, orderType, deliveryAddress } = req.body;

    // 1. التحقق من البيانات الأساسية في الطلب
    if (!pharmacyName || !orderType) {
        return res.status(400).json({ error: 'Pharmacy name and order type are required.' });
    }

    if (orderType === 'delivery' && !deliveryAddress) {
      return res.status(400).json({ error: 'Delivery address is required for delivery orders.' });
    }

    // 2. البحث عن الصيدلية باستخدام الاسم (بعد تحويله لـ slug)
    const pharmacySlug = slugify(pharmacyName, { lower: true, strict: true });
    // لا نحتاج populate هنا إذا كنا سنعتمد على جلب الاسم من مودل Product مباشرة
    const pharmacy = await Pharmacy.findOne({ slug: pharmacySlug }); 

    if (!pharmacy) {
      return res.status(404).json({ error: `Pharmacy "${pharmacyName}" not found.` });
    }

    // 3. البحث عن سلة التسوق للمستخدم الحالي
    const cart = await Cart.findOne({ userId: req.user.id }); 

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty.' });
    }

    // 4. فلترة عناصر السلة للعناصر التي تتبع الصيدلية المطلوبة والمنتجات موجودة في قائمة أدويتها
    const validPharmacyItems = [];
    let totalPrice = 0;

    // *** جلب أسماء المنتجات مسبقاً لتحسين الأداء ***
    // جمع كل productIds الفريدة من عناصر السلة التي تتبع الصيدلية المستهدفة
    const productIdsToFetch = cart.items
        .filter(item => item.pharmacyId && item.pharmacyId.toString() === pharmacy._id.toString())
        .map(item => item.productId);
    
    // جلب بيانات المنتجات (الاسم فقط) من قاعدة البيانات دفعة واحدة
    const products = await Product.find({ _id: { $in: productIdsToFetch } }).select('name').lean();
    // تحويلها إلى Map لتسهيل الوصول السريع بالـ ID
    const productMap = products.reduce((map, product) => {
        map[product._id.toString()] = product.name;
        return map;
    }, {});
    // **********************************************


    for (const cartItem of cart.items) {
        // التحقق مما إذا كان العنصر في السلة يتبع الصيدلية المطلوبة
        if (cartItem.pharmacyId && cartItem.pharmacyId.toString() === pharmacy._id.toString()) {
            // البحث عن هذا الدواء (product) في قائمة أدوية الصيدلية
            const pharmacyMedicine = pharmacy.medicines.find(med =>
                med.medicineId && med.medicineId.toString() === cartItem.productId.toString()
            );

            // إذا تم العثور على الدواء في قائمة الصيدلية
            if (pharmacyMedicine) {
                const itemPrice = pharmacyMedicine.price || 0; // سعر الدواء من بيانات الصيدلية
                const quantity = cartItem.quantity || 0;     // الكمية من السلة
                const itemTotalPrice = quantity * itemPrice;
                
                // *** هنا نحصل على اسم المنتج من الـ Map الذي أنشأناه مسبقاً ***
                const itemName = productMap[cartItem.productId.toString()] || 'Unknown Product'; // استخدام اسم المنتج من الـ Map أو قيمة افتراضية


                validPharmacyItems.push({
                    cartItemId: cartItem._id, 
                    productId: cartItem.productId, 
                    quantity: quantity,
                    pharmacyId: cartItem.pharmacyId,
                    price: itemPrice, 
                    name: itemName, // *** إضافة اسم المنتج الذي تم جلبه ***
                });
                totalPrice += itemTotalPrice; 
            }
        }
    }

    // ... (باقي الكود كما هو) ...

    // Console logs للمساعدة في Debug 
    console.log('Pharmacy ID:', pharmacy._id.toString());
    console.log('Cart Items:', cart.items.map(item => ({
        cartItemId: item._id.toString(),
        productId: item.productId.toString(),
        pharmacyId: item.pharmacyId.toString(),
        quantity: item.quantity,
        name: item.name || 'N/A' // اطبع الاسم إذا كان موجوداً في السلة
    })));
     console.log('Pharmacy Medicines:', pharmacy.medicines.map(med => ({
        _id: med._id ? med._id.toString() : 'N/A',
        medicineId: med.medicineId ? med.medicineId.toString() : 'N/A',
        name: med.name || 'N/A' // اطبع الاسم المخزن في الصيدلية (قد يكون N/A أو undefined)
    }))); 
    console.log('Valid Pharmacy Items:', validPharmacyItems.map(item => ({
        cartItemId: item.cartItemId.toString(),
        productId: item.productId.toString(),
        pharmacyId: item.pharmacyId.toString(),
        quantity: item.quantity,
        price: item.price,
        name: item.name // اطبع الاسم الذي سيتم استخدامه في الطلب
    })));


    // 5. التحقق مما إذا تم العثور على أي عناصر صالحة لإنشاء الطلب
    if (validPharmacyItems.length === 0) {
      return res.status(400).json({ error: `No valid items from ${pharmacyName} found in your cart to create an order.` });
    }

    // 6. تجهيز بيانات عناصر الطلب للحفظ في قاعدة بيانات الطلبات
    const orderItemsData = validPharmacyItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      name: item.name, // *** استخدام اسم المنتج الذي تم جلبه ***
      // priceAtOrder: item.price 
    }));

    // 7. إنشاء وثيقة الطلب الجديدة
    const order = new Order({
      userId: req.user.id,
      pharmacyId: pharmacy._id, 
      items: orderItemsData,    
      orderType,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : null,
      totalPrice: totalPrice,   
      status: 'pending',        
    });

    // 8. حفظ الطلب في قاعدة البيانات
    await order.save();

    // 9. حذف العناصر التي تم طلبها بنجاح من سلة التسوق
    const orderedCartItemIds = validPharmacyItems.map(item => item.cartItemId.toString());
     cart.items = cart.items.filter(item =>
         !orderedCartItemIds.includes(item._id.toString()) 
     );
    
    // 10. حفظ سلة التسوق بعد حذف العناصر المطلوبة
    await cart.save();

    // 11. إرسال استجابة النجاح
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
    // التحقق إذا كان الخطأ هو validation error لعرضه بشكل أفضل
    if (error.name === 'ValidationError') {
        return res.status(400).json({ 
            error: 'Validation failed when creating order.', 
            details: error.message,
            errors: error.errors // تفاصيل أخطاء التحقق
        });
    }
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
  