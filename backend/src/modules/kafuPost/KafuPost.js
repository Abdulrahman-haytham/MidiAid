const mongoose = require('mongoose');

// Define the KafuPost Schema
const kafuPostSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  type: {
    type: String,
    enum: ['Medicine Payment', 'Medicine Delivery'],
    required: true
  },
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    default: null
  },
  pharmacyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy',
    default: null
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Open'
  },
  helperId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  expiresAt: { 
    type: Date, 
    required: true
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt timestamps
});

// Index location for geospatial queries
kafuPostSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('KafuPost', kafuPostSchema);
