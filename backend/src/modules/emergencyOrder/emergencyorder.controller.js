const emergencyOrderService = require('./emergencyorder.service');

exports.createEmergencyOrder = async (req, res) => {
  try {
    const newOrder = await emergencyOrderService.createSmartEmergencyOrder(req.user.id, req.body);
    
    // (لاحقًا: هنا يمكن إرسال إشعارات WebSocket للصيدليات)
    res.status(201).json({
      message: `Emergency order created and sent to the best-matching pharmacies.`,
      order: newOrder,
    });
  } catch (err) {
    console.error("Error in createEmergencyOrder controller:", err);
    // معالجة الأخطاء التي قد تأتي من السيرفس بشكل أفضل
    if (err.message.includes('not found')) {
      return res.status(404).json({ message: err.message });
    }
    if (err.message.includes('required')) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'An error occurred while creating the emergency order.', error: err.message });
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
    // (لاحقًا: هنا يمكن إرسال إشعار WebSocket لصاحب الطلب)
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
    // (لاحقًا: هنا يمكن إرسال إشعار WebSocket للصيدليات لإعلامهم بالإلغاء)
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