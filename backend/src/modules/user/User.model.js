const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
        trim: true,
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: { 
        type: String, 
        required: true 
    },
    firstName: { 
        type: String, 
        required: true,
        trim: true,
    },
    lastName: { 
        type: String, 
        required: true,
        trim: true,
    },
    phone: { 
        type: String, 
        required: true,
        trim: true,
        match: [/^\+?[0-9]{10,15}$/, 'Invalid phone number format'], 
    },
    isVerified: { 
        type: Boolean, 
        default: false
    },
    verificationCode: { 
        type: String, 
        default: null 
    },
    address: { 
        type: String, 
        required: true,
        trim: true,
    },
    resetPasswordToken: {
  type: String,
  default: null
},
resetPasswordExpires: {
  type: Date,
  default: null
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
                           coords[0] >= -180 && coords[0] <= 180 &&
                           coords[1] >= -90 && coords[1] <= 90;
                },
                message: 'Invalid coordinates.',
            },
        },
    },
    license: { 
        type: String, 
        trim: true,
    },
    favorites: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
        },
    ],
    expiresAt: { type: Date }
}, {
    timestamps: true,
});

// الفهارس
userSchema.index({ location: '2dsphere' });
userSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// مقارنة كلمة المرور
userSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);
};

userSchema.pre('save', async function (next) {
   
    if (!this.isModified('password')) {
        return next();
    }

    try {
        this.password = await bcrypt.hash(this.password, 12); 
        next();
    } catch (error) {
        next(error);
    }
});
userSchema.pre('validate', function (next) {
    if (this.type === 'pharmacist' && !this.license) {
        this.invalidate('license', 'License is required for pharmacists');
    }
    if (this.favorites.some(fav => !mongoose.isValidObjectId(fav))) {
        this.invalidate('favorites', 'Invalid product ID format');
    }
    next();
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
