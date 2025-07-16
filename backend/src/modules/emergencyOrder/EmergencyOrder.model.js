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
    // ✅ تعديل: إضافة حالة "fulfilled" لدورة حياة مكتملة
    enum: ['pending', 'accepted', 'fulfilled', 'canceled', 'no_response'],
    default: 'pending',
  },
  // ✅ تعديل: اسم الحقل أصبح أكثر وضوحًا
  targettedPharmacies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy',
  }],
  pharmacyResponses: [
    {
      pharmacyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pharmacy',
        required: true,
      },
      response: {
        type: String,
        enum: ['accepted', 'rejected'],
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
    required: true,
  },
}, { timestamps: true });

emergencyOrderSchema.index({ location: '2dsphere' });
emergencyOrderSchema.index({ userId: 1 });
emergencyOrderSchema.index({ acceptedPharmacyId: 1 });
emergencyOrderSchema.index({ targettedPharmacies: 1 });


module.exports = mongoose.model('EmergencyOrder', emergencyOrderSchema);