const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // تأكد من تثبيت bcryptjs

const userSchema = new mongoose.Schema({
    type: { 
        type: String, 
        enum: ['admin', 'user', 'pharmacist'], 
        required: true 
    },
    username: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true, // إزالة المسافات الزائدة
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true, // إزالة المسافات الزائدة
        lowercase: true, // تحويل البريد الإلكتروني إلى أحرف صغيرة
    },
    password: { 
        type: String, 
        required: true 
    },
    firstName: { 
        type: String, 
        required: true,
        trim: true, // إزالة المسافات الزائدة
    },
    lastName: { 
        type: String, 
        required: true,
        trim: true, // إزالة المسافات الزائدة
    },
    phone: { 
        type: String, 
        required: true,
        trim: true, // إزالة المسافات الزائدة
    },
    isVerified: 
    { type: Boolean,
    default: true

     }, // حساب غير مفعل افتراضيًا
    verificationCode: 
    { type: String,
      default: null 
    }, // كود التحقق من البريد
    address: { 
        type: String, 
        required: true,
        trim: true, // إزالة المسافات الزائدة
    },
    location: {
        type: { 
            type: String, 
            enum: ['Point'], 
            default: 'Point',
            required: true 
        },
        coordinates: { 
            type: [Number], 
            required: true,
            validate: {
                validator: function (coords) {
                    return coords.length === 2 && 
                           coords[0] >= -180 && coords[0] <= 180 && // خط الطول
                           coords[1] >= -90 && coords[1] <= 90;     // خط العرض
                },
                message: 'Invalid coordinates. Longitude must be between -180 and 180, and latitude between -90 and 90.',
            },
        },
    },
    license: { 
        type: String, 
        required: function() { 
            return this.type === 'pharmacist'; 
        },
        trim: true, // إزالة المسافات الزائدة
    },
    favorites: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product', // ربط المفضلة بالمنتجات
        },
    ],
}, {
    timestamps: true, // إضافة createdAt و updatedAt تلقائيًا
});

// إنشاء فهرس جغرافي على حقل location
userSchema.index({ location: '2dsphere' });

// دالة لمقارنة كلمة المرور
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};


// إنشاء مودل المستخدم
const User =  mongoose.model('User', userSchema);

module.exports = User;