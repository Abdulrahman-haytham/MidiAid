const EmergencyOrder = require('./EmergencyOrder.model');

const emergencyOrderService = {
  
  async createOrder(orderData, recipientPharmacyIds = []) {
    const newOrder = new EmergencyOrder({
      ...orderData,
      targettedPharmacies: recipientPharmacyIds,
    });
    await newOrder.save();
    return newOrder;
  },

  async findOrderById(orderId) {
    return await EmergencyOrder.findById(orderId)
      .populate('userId', 'name email profilePicture')
      .populate('acceptedPharmacyId', 'name location');
  },

  async findOrdersByUserId(userId) {
    return await EmergencyOrder.find({ userId })
      .populate('acceptedPharmacyId', 'name location')
      .populate('pharmacyResponses.pharmacyId', 'name');
  },

  async recordPharmacyResponse(orderId, pharmacyId, responseData) {
    const { response, rejectionReason } = responseData;
    
    const update = {
      $push: {
        pharmacyResponses: {
          pharmacyId,
          response,
          rejectionReason,
          responseTime: new Date(),
        },
      },
    };

    if (response === 'accepted') {
      update.$set = {
          status: 'accepted',
          acceptedPharmacyId: pharmacyId
      };
    }

    const order = await EmergencyOrder.findOneAndUpdate(
      { _id: orderId, status: 'pending', targettedPharmacies: pharmacyId },
      update,
      { new: true }
    );

    if (!order) {
      throw new Error('Order not available for response (not found, already accepted, or you were not targetted).');
    }
    
    return order;
  },

  async cancelOrder(orderId, userId) {
    const order = await EmergencyOrder.findOneAndUpdate(
      { _id: orderId, userId: userId, status: { $in: ['pending', 'no_response'] } },
      { $set: { status: 'canceled' } },
      { new: true }
    );

    if (!order) {
      throw new Error('Order not found, not owned by user, or can no longer be canceled.');
    }
    return order;
  },


  async fulfillOrder(orderId, user) {
    const order = await EmergencyOrder.findById(orderId);

    if (!order) {
      throw new Error('Order not found.');
    }

    const isOwner = order.userId.toString() === user.id;
    const isAcceptedPharmacist = order.acceptedPharmacyId && order.acceptedPharmacyId.toString() === user.pharmacyId;

    if (!isOwner && !isAcceptedPharmacist) {
        throw new Error('Unauthorized to mark this order as fulfilled.');
    }

    if (order.status !== 'accepted') {
        throw new Error('Only accepted orders can be marked as fulfilled.');
    }
    
    order.status = 'fulfilled';
    await order.save();
    return order;
  },

  async processOrderTimeouts() {
    const currentTime = new Date();
    
    await EmergencyOrder.updateMany(
      { status: 'pending', responseTimeout: { $lt: currentTime } },
      { $set: { status: 'no_response' } }
    );
  },

  async findOrdersForPharmacy(pharmacyId) {
    return await EmergencyOrder.find({
      targettedPharmacies: pharmacyId,
      status: 'pending',
    })
      .populate('userId', 'name email profilePicture')
      .sort({ priority: -1, createdAt: 1 });
  }
};

module.exports = emergencyOrderService;