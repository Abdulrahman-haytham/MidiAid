// src/modules/user/user.controller.js

const userService = require('./user.service');
const createError = require('http-errors');


const errorHandler = (res, error, message = `Oops! ...`) => {
    console.error(message, error);
    res.status(500).json({ message, error: error.message });
};

exports.register = async (req, res) => {
    try {
        const newUser = await userService.registerUser(req.body);
        res.status(201).json({
            message: 'User registered successfully. Verify email.',
            user: { id: newUser._id, username: newUser.username, email: newUser.email }
        });
    } catch (error) {
        if (error.message.includes('Invalid') || error.message.includes('required') || error.message.includes('in use')) {
            return res.status(400).json({ message: error.message });
        }
        errorHandler(res, error, 'Registration error');
        console.log(error);
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        await userService.verifyUserEmail(req.body.email, req.body.verificationCode);
        res.json({ message: 'Account verified successfully' });
    } catch (error) {
        if (error.message.includes('required') || error.message.includes('Invalid')) {
            return res.status(400).json({ message: error.message });
        }
        errorHandler(res, error, 'Email verification error');
    }
};

exports.login = async (req, res) => {
    try {
        const result = await userService.loginUser(req.body.email, req.body.password);
        res.json(result);
    } catch (error) {
        if (error.message.includes('required') || error.message.includes('Invalid') || error.message.includes('verification required')) {
            return res.status(400).json({ message: error.message });
        }
        errorHandler(res, error, 'Login error');
    }
};

exports.logout = (req, res) => {
    try {
        res.status(200).json({ message: 'Logged out successfully.' });
    } catch (error) {
        errorHandler(res, error, 'Logout error');
    }
};

exports.getCurrentUser = async (req, res) => {
    try {
        const user = await userService.findCurrentUser(req.user.id);
        res.json(user);
    } catch (error) {
        errorHandler(res, error, 'Fetching current user error');
    }
};

exports.updateCurrentUser = async (req, res) => {
    try {
      const updatedUser = await userService.updateCurrentUserInfo(req.user.id, req.body);
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error('خطأ في تحديث بيانات المستخدم:', error);
      res.status(500).json({ error: 'حدث خطأ أثناء تحديث بيانات المستخدم' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await userService.findAllUsers();
        res.json(users);
    } catch (error) {
        errorHandler(res, error, 'Fetching users error');
    }
};

exports.updateUser = async (req, res) => {
    try {
        const user = await userService.updateUserById(req.params.id, req.user, req.body);
        res.status(200).json({ message: 'User updated successfully.', user });
    } catch (error) {
        const statusCode = error.message.includes('not found') ? 404 : error.message.includes('Unauthorized') ? 403 : 500;
        if(statusCode === 500) {
            errorHandler(res, error, 'Update user error');
        } else {
            res.status(statusCode).json({ message: error.message });
        }
    }
};

exports.deleteUser = async (req, res) => {
    try {
        await userService.deleteUserById(req.params.id, req.user);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        const statusCode = error.message.includes('not found') ? 404 : error.message.includes('Unauthorized') ? 403 : 500;
        if(statusCode === 500) {
            errorHandler(res, error, 'Delete user error');
        } else {
            res.status(statusCode).json({ message: error.message });
        }
    }
};

exports.createAdmin = async (req, res) => {
    try {
        const newUser = await userService.createNewAdmin(req.body);
        res.status(201).json({
            message: 'Admin created successfully. Verify email.',
            user: { id: newUser._id, username: newUser.username, email: newUser.email }
        });
    } catch (error) {
        const statusCode = error.message.includes('Unauthorized') ? 403 : 400;
        if (statusCode === 500) {
            errorHandler(res, error, 'Admin creation error');
        } else {
            res.status(statusCode).json({ message: error.message });
        }
    }
};

exports.requestPasswordReset = async (req, res) => {
    try {
        await userService.requestPasswordResetByEmail(req.body.email);
        res.status(200).json({ message: 'If a user with that email exists, a password reset code has been sent.' });
    } catch (error) {
        if(error.message.includes('required')) {
            return res.status(400).json({ message: error.message });
        }
        if (error.message.includes('Failed to send')) {
            return errorHandler(res, error, 'Failed to send password reset email.');
        }
        errorHandler(res, error, 'Password reset request error');
    }
};

exports.resetPassword = async (req, res) => {
    try {
        await userService.resetPasswordWithToken(req.body.email, req.body.token, req.body.password);
        res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        if (error.message.includes('required') || error.message.includes('invalid')) {
            return res.status(400).json({ message: error.message });
        }
        errorHandler(res, error, 'Password reset error');
    }
};