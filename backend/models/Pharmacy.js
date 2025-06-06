const mongoose = require('mongoose');
const slugify = require('slugify');
   

const pharmacySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  name: {
    type: String,
    required: [true, 'Pharmacy name is required'],
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
    trim: true,
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true,
  },
  location: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
      required: [true, 'Location coordinates are required'],
    },
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  openingHours: {
  type: new mongoose.Schema({
    morning: {
      from: { type: String, required: true },
      to: { type: String, required: true }
    },
    evening: {
      from: { type: String, required: true },
      to: { type: String, required: true }
    }
  }, { _id: false }),
  required: true
}
,
  workingDays: {
    type: [String],
    enum: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
    default: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'],
  }
,  
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  services: [{
    type: String,
    trim: true,
  }],
  socialMedia: {
    facebook: { type: String, trim: true },
    instagram: { type: String, trim: true },
    twitter: { type: String, trim: true },
  },
  website: {
    type: String,
    trim: true,
  },
  medicines: [
    {
      medicineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: [0, 'Quantity cannot be negative'],
      },
      price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative'],
      },
    },
  ],
  /** ✅ مصفوفة التقييمات */
  reviews: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      rating: {
        type: Number,
        required: true,
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot be more than 5'],
      },
    },
  ],
  /** ✅ متوسط التقييم */
  averageRating: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

/** ✅ دالة لحساب التقييم المتوسط */
pharmacySchema.methods.calculateAverageRating = function () {
  if (this.reviews.length > 0) {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.averageRating = sum / this.reviews.length;
  } else {
    this.averageRating = 0;
  }
};

pharmacySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});
pharmacySchema.index({ location: '2dsphere' });



module.exports = mongoose.model('Pharmacy', pharmacySchema);
