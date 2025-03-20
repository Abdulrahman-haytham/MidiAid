const mongoose = require('mongoose');

const usedMedicineSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  medicines: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      dosage: {
        type: String,
        required: true,
        trim: true,
      },
      frequency: {
        type: String, // مثال: "مرتين يومياً"
        required: true,
        trim: true,
      },
      startDate: {
        type: Date,
        default: Date.now, // تاريخ بدء الاستخدام
      },
      endDate: {
        type: Date, // يمكن للمستخدم تحديد تاريخ انتهاء الاستخدام
      },
      reminderTime: {
        type: String, // مثال: "08:00 AM"
      },
      history: [
        {
          updatedAt: { type: Date, default: Date.now },
          changes: { type: String, trim: true },
        },
      ],
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('UsedMedicine', usedMedicineSchema);
