const EmergencyOrder = require('../models/EmergencyOrder');
const Pharmacy = require('../models/Pharmacy');
const User = require('../models/User');

// إنشاء طلب إسعافي جديد
exports.createEmergencyOrder = async (req, res) => {
  try {
    const { userId, requestedMedicine, additionalNotes, location, deliveryAddress, responseTimeout, priority } = req.body;

    const newOrder = new EmergencyOrder({
      userId,
      requestedMedicine,
      additionalNotes,
      location,
      deliveryAddress,
      responseTimeout,
      priority,
    });

    // حفظ الطلب في قاعدة البيانات
    await newOrder.save();
    res.status(201).json({ message: 'Emergency order created successfully.', order: newOrder });
  } catch (err) {
    res.status(500).json({ message: 'Error creating emergency order.', error: err.message });
  }
};

// جلب طلب إسعافي معين
exports.getEmergencyOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await EmergencyOrder.findById(orderId)
      .populate('userId', 'name email')
      .populate('acceptedPharmacyId', 'name location');

    if (!order) {
      return res.status(404).json({ message: 'Emergency order not found.' });
    }

    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching emergency order.', error: err.message });
  }
};

// جلب جميع طلبات الإسعاف للمستخدم
exports.getUserEmergencyOrders = async (req, res) => {
  try {
    const userId = req.params.userId;
    const orders = await EmergencyOrder.find({ userId })
      .populate('acceptedPharmacyId', 'name location')
      .populate('pharmacyResponses.pharmacyId', 'name');

    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user emergency orders.', error: err.message });
  }
};

// رد الصيدلية على الطلب
exports.respondToEmergencyOrder = async (req, res) => {
  try {
    const { orderId, pharmacyId, response, rejectionReason } = req.body;

    const order = await EmergencyOrder.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // تحقق من إذا كانت الصيدلية قد ردت مسبقًا
    const existingResponse = order.pharmacyResponses.find(resp => resp.pharmacyId.toString() === pharmacyId.toString());
    if (existingResponse) {
      return res.status(400).json({ message: 'Pharmacy already responded to this order.' });
    }

    // إضافة رد الصيدلية
    order.pharmacyResponses.push({
      pharmacyId,
      response,
      rejectionReason,
      responseTime: new Date(),
    });

    // إذا تم قبول الطلب من قبل الصيدلية
    if (response === 'accepted') {
      order.status = 'accepted';
      order.acceptedPharmacyId = pharmacyId;
    }

    // إذا تم رفض الطلب من جميع الصيدليات
    if (order.pharmacyResponses.filter(resp => resp.response === 'accepted').length === 0) {
      order.status = 'no_response';
    }

    await order.save();
    res.status(200).json({ message: 'Response recorded successfully.', order });
  } catch (err) {
    res.status(500).json({ message: 'Error responding to emergency order.', error: err.message });
  }
};

// إلغاء طلب إسعافي
exports.cancelEmergencyOrder = async (req, res) => {
  try {
    const { orderId, userId } = req.body;

    const order = await EmergencyOrder.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    if (order.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You are not authorized to cancel this order.' });
    }

    order.status = 'canceled';
    await order.save();

    res.status(200).json({ message: 'Emergency order canceled successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Error canceling emergency order.', error: err.message });
  }
};

// فحص الطلبات التي تحتاج إلى تحديث
exports.checkOrderTimeouts = async () => {
  try {
    const currentTime = new Date();
    const expiredOrders = await EmergencyOrder.find({
      status: 'pending',
      responseTimeout: { $lt: currentTime },
    });

    for (const order of expiredOrders) {
      order.status = 'timed_out';
      await order.save();
    }

    console.log(`Checked ${expiredOrders.length} orders for timeout.`);
  } catch (err) {
    console.error('Error checking for order timeouts:', err.message);
  }
};
// جلب كل الطلبات المرسلة للصيدلية
exports.getPharmacyOrders = async (req, res) => {
    try {
      const pharmacyId = req.params.pharmacyId;
  
      // جلب الطلبات التي تم إرسالها إلى الصيدلية
      const orders = await EmergencyOrder.find({
        'pharmacyResponses.pharmacyId': pharmacyId,
      })
        .populate('userId', 'name email')
        .populate('pharmacyResponses.pharmacyId', 'name location')
        .select('requestedMedicine deliveryAddress status pharmacyResponses');
  
      if (!orders || orders.length === 0) {
        return res.status(404).json({ message: 'No emergency orders found for this pharmacy.' });
      }
  
      res.status(200).json(orders);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching pharmacy orders.', error: err.message });
    }
  };
  