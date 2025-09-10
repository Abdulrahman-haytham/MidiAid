const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  pharmacyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy',
    required: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      name: {
        type: String,
        required: true, 
        trim: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
    },
  ],
  orderType: {
    type: String,
    enum: ['delivery', 'reservation'],
    required: true,
  },
  deliveryAddress: {
    type: String,
    required: function () {
      return this.orderType === 'delivery';
    },
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'preparing', 'in_delivery', 'delivered', 'canceled'],
    default: 'pending',
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
}, { timestamps: true }); 

module.exports = mongoose.model('Order', orderSchema);
