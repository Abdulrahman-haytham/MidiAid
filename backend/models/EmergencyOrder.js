const mongoose = require('mongoose');

const emergencyOrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  requestedMedicine: {
    type: String,
    required: true,
    trim: true,
  },
  additionalNotes: {
    type: String,
    trim: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  deliveryAddress: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'fulfilled', 'canceled', 'timed_out', 'no_response'],
    default: 'pending',
  },
  pharmacyResponses: [
    {
      pharmacyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pharmacy',
        required: true,
      },
      response: {
        type: String,
        enum: ['accepted', 'rejected', null],
        default: null,
      },
      responseTime: Date,
      rejectionReason: {
        type: String,
        trim: true,
      },
    },
  ],
  acceptedPharmacyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy',
    default: null,
  },
  priority: {
    type: String,
    enum: ['high', 'normal'],
    default: 'high',
  },
  responseTimeout: {
    type: Date,
    required: true, // تحديد الوقت الذي تنتهي فيه مهلة الرد
  },
}, { timestamps: true });

emergencyOrderSchema.index({ location: '2dsphere' });
emergencyOrderSchema.index({ userId: 1 });
emergencyOrderSchema.index({ acceptedPharmacyId: 1 });

module.exports = mongoose.model('EmergencyOrder', emergencyOrderSchema);
