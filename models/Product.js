const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
    trim: true,
  },
  type: {
    type: String,
    required: [true, 'Product type is required'],
    enum: ['Medicine', 'Medical Supply', 'Personal Care', 'Vitamin', 'Other'],
    default: 'Medicine',
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required'],
  },
  sub_category: {
    type: String,
    trim: true,
  },
  brand: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
  },
  manufacturer: {
    type: String,
    trim: true,
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'],
    trim: true,
  },
  isActive: {
    type: Boolean,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isAdminCreated: {
    type: Boolean,
    default: false, // ✅ إذا كان المنتج مضافًا من قبل الصيدلي، يبقى `false`
  },
}, {
  timestamps: true,
});

// Middleware to generate slug before saving
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});
// Middleware لتعيين createdBy و isAdminCreated تلقائيًا
// productSchema.pre('save', function (next) {
//   const user = this.model('User').findById(this.createdBy); // افترض أن createdBy تم تمريره
//   if (!user) {
//     return next(new Error('User not found'));
//   }

  // إذا كان المستخدم admin، يتم تعيين isAdminCreated إلى true
//   if (user.role === 'admin') {
//     this.isAdminCreated = true;
//   }
//    next();
// ;

module.exports = mongoose.model('Product', productSchema);
