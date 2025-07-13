// src/modules/emergencyOrder/emergencyorder.controller.js

const emergencyOrderService = require('./emergencyorder.service');

// إنشاء طلب إسعافي جديد
exports.createEmergencyOrder = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ تحسين: أخذ الـ ID من المستخدم المسجل دخوله
    
    // (منطق اختياري) يمكن هنا تحديد الصيدليات المستهدفة بناءً على موقع المستخدم
    const recipientPharmacyIds = []; // e.g., await findNearbyPharmacies(req.body.location);
    
    const newOrder = await emergencyOrderService.createOrder({ ...req.body, userId }, recipientPharmacyIds);
    res.status(201).json({ message: 'Emergency order created successfully.', order: newOrder });
  } catch (err) {
    res.status(500).json({ message: 'Error creating emergency order.', error: err.message });
  }
};

// جلب طلب إسعافي معين
exports.getEmergencyOrder = async (req, res) => {
  try {
    const order = await emergencyOrderService.findOrderById(req.params.id);
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
    const userId = req.user.id; // ✅ تحسين: جلب طلبات المستخدم الحالي فقط
    const orders = await emergencyOrderService.findOrdersByUserId(userId);
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user emergency orders.', error: err.message });
  }
};

// رد الصيدلية على الطلب
exports.respondToEmergencyOrder = async (req, res) => {
  try {
    const { orderId } = req.params; // ✅ تحسين: أخذ orderId من URL
    const pharmacyId = req.user.pharmacyId; // ✅ تحسين: أخذ pharmacyId من المستخدم المسجل (الصيدلاني)

    if (!pharmacyId) {
      return res.status(403).json({ message: 'User is not associated with a pharmacy.' });
    }
    
    const order = await emergencyOrderService.recordPharmacyResponse(orderId, pharmacyId, req.body);
    res.status(200).json({ message: 'Response recorded successfully.', order });
  } catch (err) {
    // يمكن استخدام AppError هنا لتحديد status code بشكل أفضل
    res.status(400).json({ message: 'Error responding to emergency order.', error: err.message });
  }
};

// إلغاء طلب إسعافي
exports.cancelEmergencyOrder = async (req, res) => {
  try {
    const { orderId } = req.params; // ✅ تحسين: أخذ orderId من URL
    const userId = req.user.id; // ✅ تحسين: أخذ userId من المستخدم المسجل

    await emergencyOrderService.cancelOrder(orderId, userId);
    res.status(200).json({ message: 'Emergency order canceled successfully.' });
  } catch (err) {
    res.status(400).json({ message: 'Error canceling emergency order.', error: err.message });
  }
};

// جلب كل الطلبات المرسلة للصيدلية
exports.getPharmacyOrders = async (req, res) => {
    try {
      const pharmacyId = req.user.pharmacyId; // ✅ تحسين: جلب طلبات الصيدلية الحالية فقط
      if (!pharmacyId) {
        return res.status(403).json({ message: 'User is not associated with a pharmacy.' });
      }

      const orders = await emergencyOrderService.findOrdersForPharmacy(pharmacyId);
      
      // لا داعي للتحقق من 404 هنا، من الطبيعي ألا يكون هناك طلبات
      res.status(200).json(orders);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching pharmacy orders.', error: err.message });
    }
};