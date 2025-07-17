// src/modules/user/user.service.js

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('./User.model');
const createToken = require('../../core/lib/token');
const sendEmail = require('../../core/lib/email');
const createError = require('http-errors');

const userService = {


  async registerUser(userData) {
    const { username, email, password, firstName, lastName, phone, address, location, type, license } = userData;

    if (!['user', 'pharmacist'].includes(type)) throw new Error('Invalid user type');
    if (!username || !email || !password || !firstName || !lastName || !phone || !address || !location || !type) throw new Error('All fields are required');
    if (type === 'pharmacist' && !license) throw new Error('Pharmacists must provide a license');

    const [existingEmail, existingUsername] = await Promise.all([
        User.findOne({ email: email.toLowerCase() }),
        User.findOne({ username: username.toLowerCase() })
    ]);

    if (existingEmail) throw new Error('Email already in use');
    if (existingUsername) throw new Error('Username already in use');

    const verificationCode = crypto.randomInt(100000, 999999).toString();
    
    const newUser = new User({
        username: username.toLowerCase(), email: email.toLowerCase(), password: password,
        firstName, lastName, phone, address, location, type,
        license: type === 'pharmacist' ? license : null,
        verificationCode
    });
    await newUser.save();

    await sendEmail({
        email: newUser.email,
        subject: 'Verification Code',
        message: `Your verification code is: ${verificationCode}`
    });
    
    return newUser;
  },


  async verifyUserEmail(email, verificationCode) {
    if (!email || !verificationCode) throw new Error('Email and code are required');
    const user = await User.findOne({ email: email.toLowerCase(), verificationCode });
    if (!user) throw new Error('Invalid code or user not found');

    user.isVerified = true;
    user.verificationCode = null;
    user.expiresAt = undefined;
    await user.save();
  },

  async loginUser(email, password) {
  if (!email || !password) {
    throw createError(400, 'Email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw createError(401, 'Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw createError(401, 'Invalid email or password');
  }

  if (!user.isVerified) {
    throw createError(403, 'Email verification required');
  }

  const token = createToken(user._id, user.type);

  return {
    token,
    user: {
      id: user._id,
      email: user.email,
      type: user.type,
    },
  };
},

 
  async findCurrentUser(userId) {
    return await User.findById(userId).select('type username email firstName lastName phone address location ');
  },


  async updateCurrentUserInfo(userId, updatesData) {
    const allowedUpdates = ['username', 'firstName', 'lastName', 'email', 'phone', 'address', 'location'];
    const updates = {};
    allowedUpdates.forEach(field => {
      if (updatesData[field] !== undefined) {
        updates[field] = updatesData[field];
      }
    });
    return await User.findByIdAndUpdate(userId, { $set: updates }, { new: true, runValidators: true }).select('-password');
  },

  
  async findAllUsers() {
    return await User.find().select('-password');
  },
  
 
  async updateUserById(userIdToUpdate, updatingUser, updateData) {
    const user = await User.findById(userIdToUpdate);
    if (!user) throw new Error('User not found');
    if (updatingUser.id !== userIdToUpdate && updatingUser.type !== 'admin') {
        throw new Error('Unauthorized');
    }
    const { type, username, email, password, firstName, lastName, phone, address, location } = updateData;
    user.type = type || user.type;
    user.username = username || user.username;
    user.email = email || user.email;
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    user.location = location || user.location;
    if (password) user.password = password;
    await user.save();
    return user;
  },


  async deleteUserById(userIdToDelete, deletingUser) {
    const userToDeleteDoc = await User.findById(userIdToDelete);
    if (!userToDeleteDoc) throw new Error('User not found');
    if (deletingUser.id !== userIdToDelete && deletingUser.type !== 'admin') {
      throw new Error('Unauthorized');
    }
    await User.findByIdAndDelete(userIdToDelete);
  },

 
  async createNewAdmin(adminData) {
    const { secret_key, username, email, password, firstName, lastName, phone, address, location } = adminData;
    if (!secret_key || secret_key !== process.env.SECRET_KEY_ADMIN) {
        throw new Error('Unauthorized');
    }
    const type = 'admin';
    if (!username || !email || !password || !firstName || !lastName || !phone || !address || !location) {
        throw new Error('All fields are required');
    }
    const [existingEmail, existingUsername] = await Promise.all([
        User.findOne({ email: email.toLowerCase() }),
        User.findOne({ username: username.toLowerCase() })
    ]);
    if (existingEmail) throw new Error('Email already in use');
    if (existingUsername) throw new Error('Username already in use');
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const newUser = new User({
        username: username.toLowerCase(), email: email.toLowerCase(), password: password,
        firstName, lastName, phone, address, location, type, verificationCode
    });
    await newUser.save();
    await sendEmail({
        email: newUser.email,
        subject: 'Verification Code',
        message: `Your verification code is: ${verificationCode}`
    });
    return newUser;
  },


  async requestPasswordResetByEmail(email) {
    if (!email) throw new Error('Email is required');
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return; // لا نُرجع خطأ للحماية من تعداد المستخدمين

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedToken = crypto.createHash('sha256').update(resetCode).digest('hex');
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your Password Reset Code',
            message: `Your password reset code is: ${resetCode}. It is valid for 1 hour.`,
        });
    } catch (emailError) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        // إعادة إلقاء الخطأ ليتم التقاطه في الكونترولر
        throw new Error('Failed to send password reset email.');
    }
  },


  async resetPasswordWithToken(email, token, password) {
    if (!email || !token || !password) {
        throw new Error('Email, token, and new password are required');
    }
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
        email: email.toLowerCase(),
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) {
        throw new Error('Password reset token is invalid or has expired.');
    }
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
  }
};

module.exports = userService;