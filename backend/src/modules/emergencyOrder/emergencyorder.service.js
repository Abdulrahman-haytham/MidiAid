const EmergencyOrder = require('./EmergencyOrder.model');
const Product = require('../product/Product.model');
const Pharmacy = require('../pharmacy/Pharmacy.model');
const User=require('../user/User.model')
const emergencyOrderService = {

  async createSmartEmergencyOrder(userId, orderRequestData) {
  const { 
    requestedMedicine, 
    location, 
    deliveryAddress, 
    additionalNotes, 
    priority = 'high', 
    responseTimeoutInMinutes = 15 
  } = orderRequestData;

  if (!requestedMedicine) {
    throw new Error('Medicine name is required.');
  }

  let finalLocation = null;

  if (location && location.coordinates) {
    // إذا بعت موقع بالطلب
    finalLocation = location;
  } else {
    // إذا ما بعت موقع منروح منجيب من بياناته
    const user = await User.findById(userId);
    if (!user || !user.location || !user.location.coordinates) {
      throw new Error('User location not found. Please provide a location.');
    }
    finalLocation = user.location;
  }
   console.log(finalLocation);
  // --- بداية منطق البحث الذكي ---
  const product = await Product.findOne({ name: { $regex: requestedMedicine, $options: 'i' } });
  if (!product) {
    throw new Error(`Product "${requestedMedicine}" not found in our system.`);
  }

  const nearbyPharmacies = await Pharmacy.aggregate([
    { 
      $geoNear: { 
        near: { type: "Point", coordinates: finalLocation.coordinates }, 
        distanceField: "distance", 
        maxDistance: 5000,
        spherical: true 
      } 
    },
    { $match: { isActive: true } },
    { $project: { name: 1, averageRating: 1, medicines: 1, distance: 1 } }
  ]);

  const scoredPharmacies = nearbyPharmacies.map(pharmacy => {
    const distanceScore = Math.max(0, 50 - (pharmacy.distance / 5000) * 50);
    const ratingScore = (pharmacy.averageRating || 0) / 5 * 30;
    const pharmacyProductIds = pharmacy.medicines.map(med => med.medicineId.toString());
    const hasProduct = pharmacyProductIds.includes(product._id.toString());
    const availabilityScore = hasProduct ? 20 : 0;
    const totalScore = distanceScore + ratingScore + availabilityScore;
    return { _id: pharmacy._id, score: totalScore, hasProduct: hasProduct };
  });

  scoredPharmacies.sort((a, b) => b.score - a.score);

  const targettedPharmacyIds = scoredPharmacies
    .filter(p => p.hasProduct && p.score > 40)
    .slice(0, 5)
    .map(p => p._id);

  if (targettedPharmacyIds.length === 0) {
    throw new Error('Unfortunately, no nearby pharmacies currently have this product in stock.');
  }

  const responseTimeout = new Date(Date.now() + responseTimeoutInMinutes * 60 * 1000);

  const newOrder = new EmergencyOrder({
    userId,
    requestedMedicine: product.name,
    location: finalLocation, 
    deliveryAddress,
    additionalNotes,
    priority,
    responseTimeout,
    targettedPharmacies: targettedPharmacyIds
  });

  await newOrder.save();
  return newOrder;
}
,

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
