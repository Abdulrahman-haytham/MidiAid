const express = require('express');
const bcrypt = require('bcryptjs'); // Library for hashing passwords
const jwt = require('jsonwebtoken'); // Library for creating JSON Web Tokens
const User = require('../models/user'); // User model
const isAuthenticated = require('../middlewares/isAuthenticated'); // Middleware to check if user is authenticated
const hasRole = require('../middlewares/hasRole'); // Middleware to check if user has a specific role
const isOwner = require('../middlewares/isOwner'); // Middleware to check if user is the owner
const router = express.Router();
const nodemailer = require('nodemailer'); // استيراد nodemailer
const crypto = require('crypto'); // لإنشاء كود عشوائي
// Function to create a JWT token
const createToken = (id, type) => {
    return jwt.sign({ id, type }, process.env.JWT_SECRET, { expiresIn: '1d' });
};



const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Function to handle errors
const errorHandler = (res, error, message = 'Server error') => {
    console.error(message, error);
    res.status(500).json({ message, error: error.message });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, firstName, lastName, phone, address, location, type, license } = req.body;

        // Validate user type
        if (type !== 'user' && type !== 'pharmacist') {
            return res.status(400).json({ 
                success: false,
                message: 'Validation error: Invalid user type. Allowed types are "user" or "pharmacist"',
            });
        }

        // Check if all required fields are provided
        if (!username || !email || !password || !firstName || !lastName || !phone || !address || !location || !type) {
            return res.status(400).json({ 
                success: false,
                message: 'Validation error: All fields are required',
                missingFields: {
                    username: !username,
                    email: !email,
                    password: !password,
                    firstName: !firstName,
                    lastName: !lastName,
                    phone: !phone,
                    address: !address,
                    location: !location,
                    type: !type,
                },
            });
        }

        // Check if license is provided for pharmacists
        if (type === 'pharmacist' && !license) {
            return res.status(400).json({ 
                success: false,
                message: 'Validation error: Pharmacists must provide a license URL',
            });
        }

        // Check if email is already in use
        const existingEmail = await User.findOne({ email: email.toLowerCase() });
        if (existingEmail) {
            return res.status(400).json({ 
                success: false,
                message: 'Validation error: Email already in use',
            });
        }

        // Check if username is already in use
        const existingUsername = await User.findOne({ username: username.toLowerCase() });
        if (existingUsername) {
            return res.status(400).json({ 
                success: false,
                message: 'Validation error: Username already in use',
            });
        }

        // Generate a random verification code
        const verificationCode = crypto.randomInt(100000, 999999).toString();

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user with verification code
        const newUser = new User({
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password: hashedPassword,
            firstName,
            lastName,
            phone,
            address,
            location,
            type,
            license: type === 'pharmacist' ? license : null,
            verificationCode, // Add the verification code here
        });

        // Save the user to the database
        await newUser.save();
        
        console.log("📩 Email received:", req.body.email);

        // Send the verification code via email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verification Code for Your Account',
            text: `Your verification code is: ${verificationCode}`,
        });

        // Return success response
        res.status(201).json({ 
            success: true,
            message: 'User registered successfully. Please verify your email.',
            data: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                type: newUser.type,
            },
        });
    } catch (error) {
        errorHandler(res, error, 'Registration error');
    }
});

// @desc    Verify user email
// @route   POST /api/auth/verify-email
// @access  Public
router.post('/verify-email', async (req, res) => {
    try {
        const { email, verificationCode } = req.body;

        if (!email || !verificationCode) {
            return res.status(400).json({ 
                success: false,
                message: 'Validation error: Email and verification code are required',
            });
        }

        // Search for the user in the database
        const user = await User.findOne({ 
            email: email.toLowerCase(), 
            verificationCode 
        });

        if (!user) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid verification code or user not found' 
            });
        }

        // Update verification status and activate the account
        user.isVerified = true;
        user.verificationCode = null; // Remove the verification code after activation
        await user.save();

        res.json({ 
            success: true,
            message: 'Your account has been successfully verified! You can now log in.',
        });
    } catch (error) {
        errorHandler(res, error, 'Error during email verification');
    }
});

// @desc    Login a user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if email and password are provided
        if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

        // Find the user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return res.status(400).json({ message: 'Invalid email or password' });
        if (!user.isVerified) {
            return res.status(400).json({ message: 'يجب تأكيد الحساب عبر البريد الإلكتروني قبل تسجيل الدخول' });
        }
        // Compare the provided password with the hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

        // Create a JWT token
        const token = createToken(user._id, user.type);

        // Send the token and user details in the response
        res.json({ token, user: { id: user._id, email: user.email, type: user.type } });
    } catch (error) {
        errorHandler(res, error, 'Login error');
    }
});

// @desc    Logout a user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', isAuthenticated, (req, res) => {
    try {
        res.status(200).json({ message: 'Logged out successfully.' });
    } catch (error) {
        errorHandler(res, error, 'Logout error');
    }
});

// @desc    Get current user's details
// @route   GET /api/auth/me
// @access  Private
router.get('/me', isAuthenticated, async (req, res) => {
    try {
        // Find the user by ID and exclude the password field
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        errorHandler(res, error, 'Fetching current user error');
    }
});

// @desc    Get all users (Admin only)
// @route   GET /api/auth/
// @access  Private (Admin)
router.get('/', isAuthenticated, hasRole('admin'), async (req, res) => {
    try {
        // Find all users and exclude the password field
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        errorHandler(res, error, 'Fetching users error');
    }
});

// @desc    Update a user's details
// @route   PUT /api/auth/users/:id
// @access  Private
router.put('/users/:id', isAuthenticated, async (req, res) => {
    try {
        const { type, username, email, password, firstName, lastName, phone, address, location } = req.body;

        // Find the user by ID
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Check if the current user is authorized to update this user
        if (req.user.id !== req.params.id && req.user.type !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Update the user's details
        user.type = type || user.type;
        user.username = username || user.username;
        user.email = email || user.email;
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.phone = phone || user.phone;
        user.address = address || user.address;
        user.location = location || user.location;
        if (password) user.password = await bcrypt.hash(password, 10);

        // Save the updated user
        await user.save();
        res.status(200).json({ message: 'User updated successfully.', user });
    } catch (error) {
        errorHandler(res, error, 'Update user error');
    }
});

// @desc    Delete a user (Admin or owner only)
// @route   DELETE /api/auth/users/:id
// @access  Private
router.delete('/users/:id', isAuthenticated, async (req, res) => {
    try {
        // Find the user by ID
        const userToDelete = await User.findById(req.params.id);
        if (!userToDelete) return res.status(404).json({ message: 'User not found' });

        // Check if the current user is authorized to delete this user
        if (req.user.id !== userToDelete._id.toString() && req.user.type !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Delete the user
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        errorHandler(res, error, 'Delete user error');
    }
});


router.post('/create-admin', async (req, res) => {
    try {
        const { username, email, password, firstName, lastName, phone, address, location, type, secret_key } = req.body;

        // التحقق من المفتاح السري
        if (!secret_key || secret_key !== process.env.SECRET_KEY_ADMIN) {
            return res.status(403).json({ 
                success: false,
                message: 'Unauthorized: Invalid or missing secret key',
            });
        }

        // التحقق من الحقول المطلوبة
        if (!username || !email || !password || !firstName || !lastName || !phone || !address || !location || !type) {
            return res.status(400).json({ 
                success: false,
                message: 'Validation error: All fields are required',
                missingFields: {
                    username: !username,
                    email: !email,
                    password: !password,
                    firstName: !firstName,
                    lastName: !lastName,
                    phone: !phone,
                    address: !address,
                    location: !location,
                    type: !type,
                },
            });
        }

        // التحقق من أن النوع هو "أدمن"
        if (type !== 'admin') {
            return res.status(400).json({ 
                success: false,
                message: 'Validation error: Only admin users can be created through this route',
            });
        }

        // التحقق من البريد الإلكتروني المكرر
        const existingEmail = await User.findOne({ email: email.toLowerCase() });
        if (existingEmail) {
            return res.status(400).json({ 
                success: false,
                message: 'Validation error: Email already in use',
            });
        }

        // التحقق من اسم المستخدم المكرر
        const existingUsername = await User.findOne({ username: username.toLowerCase() });
        if (existingUsername) {
            return res.status(400).json({ 
                success: false,
                message: 'Validation error: Username already in use',
            });
        }

        // تشفير كلمة المرور
        const hashedPassword = await bcrypt.hash(password, 10);

        // إنشاء مستخدم جديد
        const newUser = new User({
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password: hashedPassword,
            firstName,
            lastName,
            phone,
            address,
            location,
            type, // نوع المستخدم هو "أدمن"
        });

        // حفظ المستخدم في قاعدة البيانات
        await newUser.save();

        // إرجاع الرد الناجح
        res.status(201).json({ 
            success: true,
            message: 'Admin user created successfully',
            data: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                type: newUser.type,
            },
        });
    } catch (error) {
        errorHandler(res, error, 'Admin creation error');
    }
});

module.exports = router;