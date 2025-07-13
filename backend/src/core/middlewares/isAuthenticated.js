const jwt = require('jsonwebtoken');
const User = require('../../modules/user/User.model');
const isAuthenticated = async (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authorization header is missing or does not start with "Bearer".' });
        }

        const token = authHeader.replace('Bearer ', '');

        // Ensure JWT_SECRET is defined
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: 'Server configuration error: JWT_SECRET is not defined.' });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token has expired. Please log in again.' });
            }
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ message: 'Invalid token.' });
            }
            throw error; // Re-throw unexpected errors
        }

        if (!decoded || !decoded.id) {
            return res.status(401).json({ message: 'Invalid token payload.' });
        }

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'User not found.' });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({ message: 'Server error during authentication.' });
    }
};

module.exports = isAuthenticated;