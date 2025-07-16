const emergencyOrderService = require('./emergencyorder.service');
const pharmacyService = require('../pharmacy/pharmacy.service');

exports.createEmergencyOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { location, responseTimeoutInMinutes = 15 } = req.body; // مهلة افتراضية 15 دقيقة

    if (!location || !location.coordinates) {
        return res.status(400).json({ message: 'Location is required to find nearby pharmacies.' });
    }
    
    // ✅ تعديل: تنفيذ منطق التوزيع
    const nearbyPharmacies = await pharmacyService.findNearbyPharmacies(location.coordinates[0], location.coordinates[1]);
    const recipientPharmacyIds = nearbyPharmacies.map(p => p._id);

    if (recipientPharmacyIds.length === 0) {
        return res.status(404).json({ message: 'No nearby pharmacies found to send the order to.' });
    }
    
    // حساب تاريخ انتهاء الصلاحية
    const responseTimeout = new Date(Date.now() + responseTimeoutInMinutes * 60 * 1000);

    const newOrder = await emergencyOrderService.createOrder({ ...req.body, userId, responseTimeout }, recipientPharmacyIds);
    // (لاحقًا: هنا يمكن إرسال إشعارات WebSocket للصيدليات)
    res.status(201).json({ message: 'Emergency order created and sent to nearby pharmacies.', order: newOrder });
  } catch (err) {
    res.status(500).json({ message: 'Error creating emergency order.', error: err.message });
  }
};

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

exports.getUserEmergencyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await emergencyOrderService.findOrdersByUserId(userId);
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user emergency orders.', error: err.message });
  }
};

exports.getPharmacyOrders = async (req, res) => {
    try {
      const pharmacyId = req.user.pharmacyId;
      if (!pharmacyId) {
        return res.status(403).json({ message: 'User is not a pharmacist.' });
      }
      const orders = await emergencyOrderService.findOrdersForPharmacy(pharmacyId);
      res.status(200).json(orders);
    } catch (err) {
      res.status(500).json({ message: 'Error fetching pharmacy orders.', error: err.message });
    }
};

exports.respondToEmergencyOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const pharmacyId = req.user.pharmacyId;

    if (!pharmacyId) {
      return res.status(403).json({ message: 'User is not a pharmacist.' });
    }
    
    const order = await emergencyOrderService.recordPharmacyResponse(orderId, pharmacyId, req.body);
    res.status(200).json({ message: 'Response recorded successfully.', order });
  } catch (err) {
    res.status(400).json({ message: 'Error responding to emergency order.', error: err.message });
  }
};

exports.cancelEmergencyOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    await emergencyOrderService.cancelOrder(orderId, userId);
    res.status(200).json({ message: 'Emergency order canceled successfully.' });
  } catch (err) {
    res.status(400).json({ message: 'Error canceling emergency order.', error: err.message });
  }
};


exports.fulfillEmergencyOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const user = req.user; 

        const order = await emergencyOrderService.fulfillOrder(orderId, user);
        res.status(200).json({ message: 'Order marked as fulfilled.', order });
    } catch (err) {
        res.status(400).json({ message: 'Error fulfilling order.', error: err.message });
    }
};