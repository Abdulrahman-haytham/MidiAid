const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const createToken = require('../lib/token');
const sendEmail = require('../lib/email');

const errorHandler = (res, error, message = `Oops! Our servers are taking a quick break ☕️  
    We’re on it! Try refreshing, or contact us at [midiaidx@gmail.com] if the issue lingers. Thanks for your patience!`) => {
        console.error(message, error);
        res.status(500).json({ message, error: error.message });
    };
    

// تسجيل مستخدم جديد
exports.register = async (req, res) => {
    
    try {
        const { username, email, password, firstName, lastName, phone, address, location, type, license } = req.body;

        // التحقق من نوع المستخدم
        if (!['user', 'pharmacist'].includes(type)) {
            return res.status(400).json({ message: 'Invalid user type' });
        }

        // التحقق من إدخال جميع البيانات المطلوبة
        if (!username || !email || !password || !firstName || !lastName || !phone || !address || !location || !type) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // التحقق من وجود الترخيص إذا كان المستخدم صيدليًا
        if (type === 'pharmacist' && !license) {
            return res.status(400).json({ message: 'Pharmacists must provide a license' });
        }

        // التأكد من أن البريد الإلكتروني أو اسم المستخدم غير مستخدم مسبقًا
        const [existingEmail, existingUsername] = await Promise.all([
            User.findOne({ email: email.toLowerCase() }),
            User.findOne({ username: username.toLowerCase() })
        ]);

        if (existingEmail) return res.status(400).json({ message: 'Email already in use' });
        if (existingUsername) return res.status(400).json({ message: 'Username already in use' });

        // إنشاء رمز التحقق وتشفير كلمة المرور
        const verificationCode = crypto.randomInt(100000, 999999).toString();
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // إنشاء مستخدم جديد
        const newUser = new User({
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password: hashedPassword,
            firstName, lastName, phone, address, location, type,
            license: type === 'pharmacist' ? license : null,
            verificationCode
        });

        // حفظ المستخدم في قاعدة البيانات
        await newUser.save();

        // إرسال البريد الإلكتروني باستخدام الدالة من lib/sendEmail.js
        await sendEmail({
            email: newUser.email,
            subject: 'Verification Code',
            message: `Your verification code is: ${verificationCode}`
        });

        res.status(201).json({
            message: 'User registered successfully. Verify email.',
            user: { id: newUser._id, username, email }
        });

    } catch (error) {
        errorHandler(res, error, 'Registration error');
        console.log(error)
    }
};

// تأكيد البريد الإلكتروني
exports.verifyEmail = async (req, res) => {
    try {
        const { email, verificationCode } = req.body;
        if (!email || !verificationCode) return res.status(400).json({ message: 'Email and code are required' });

        const user = await User.findOne({ email: email.toLowerCase(), verificationCode });
        if (!user) return res.status(400).json({ message: 'Invalid code or user not found' });

        user.isVerified = true;
        user.verificationCode = null;
        await user.save();

        res.json({ message: 'Account verified successfully' });
    } catch (error) {
        errorHandler(res, error, 'Email verification error');
    }
};

// تسجيل الدخول
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        if (!user.isVerified) return res.status(400).json({ message: 'Email verification required' });

        const token = createToken(user._id, user.type);
        res.json({ token, user: { id: user._id, email, type: user.type } });
    } catch (error) {
        errorHandler(res, error, 'Login error');
    }
};

// تسجيل الخروج
exports.logout = (req, res) => {
    try {
        res.status(200).json({ message: 'Logged out successfully.' });
    } catch (error) {
        errorHandler(res, error, 'Logout error');
    }
};

// جلب بيانات المستخدم الحالي
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        errorHandler(res, error, 'Fetching current user error');
    }
};

// جلب جميع المستخدمين (للمدير فقط)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        errorHandler(res, error, 'Fetching users error');
    }
};

// تعديل بيانات المستخدم
exports.updateUser = async (req, res) => {
    try {
        const { type, username, email, password, firstName, lastName, phone, address, location } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (req.user.id !== req.params.id && req.user.type !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        user.type = type || user.type;
        user.username = username || user.username;
        user.email = email || user.email;
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.phone = phone || user.phone;
        user.address = address || user.address;
        user.location = location || user.location;
        if (password) user.password = await bcrypt.hash(password, 10);

        await user.save();
        res.status(200).json({ message: 'User updated successfully.', user });
    } catch (error) {
        errorHandler(res, error, 'Update user error');
    }
};

// حذف مستخدم
exports.deleteUser = async (req, res) => {
    try {
        const userToDelete = await User.findById(req.params.id);
        if (!userToDelete) return res.status(404).json({ message: 'User not found' });

        if (req.user.id !== userToDelete._id.toString() && req.user.type !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        errorHandler(res, error, 'Delete user error');
    }
};

// إنشاء حساب أدمن
exports.createAdmin = async (req, res) => {
    try {
        const { secret_key, username, email, password, firstName, lastName, phone, address, location } = req.body;

        // التحقق من مفتاح السر
        if (!secret_key || secret_key !== process.env.SECRET_KEY_ADMIN) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // إذا كان المفتاح صحيحًا، حول النوع إلى "admin"
        const type = 'admin';

        // التحقق من إدخال جميع البيانات المطلوبة
        if (!username || !email || !password || !firstName || !lastName || !phone || !address || !location) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // التأكد من أن البريد الإلكتروني أو اسم المستخدم غير مستخدم مسبقًا
        const [existingEmail, existingUsername] = await Promise.all([
            User.findOne({ email: email.toLowerCase() }),
            User.findOne({ username: username.toLowerCase() })
        ]);

        if (existingEmail) return res.status(400).json({ message: 'Email already in use' });
        if (existingUsername) return res.status(400).json({ message: 'Username already in use' });

        // إنشاء رمز التحقق وتشفير كلمة المرور
        const verificationCode = crypto.randomInt(100000, 999999).toString();
        const hashedPassword = await bcrypt.hash(password, 10);

        // إنشاء مستخدم جديد مع نوع "admin"
        const newUser = new User({
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password: hashedPassword,
            firstName, lastName, phone, address, location, type,
            verificationCode
        });

        // حفظ المستخدم في قاعدة البيانات
        await newUser.save();

        // إرسال البريد الإلكتروني باستخدام الدالة من lib/sendEmail.js
        await sendEmail({
            email: newUser.email,
            subject: 'Verification Code',
            message: `Your verification code is: ${verificationCode}`
        });

        res.status(201).json({
            message: 'Admin created successfully. Verify email.',
            user: { id: newUser._id, username, email }
        });

    } catch (error) {
        errorHandler(res, error, 'Admin creation error');
    }
};

