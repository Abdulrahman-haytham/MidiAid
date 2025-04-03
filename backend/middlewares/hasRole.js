const hasRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.type)) { // تغيير role إلى type
            return res.status(403).json({ message: 'Forbidden: Access Denied' });
        }
        next();
    };
};

module.exports = hasRole;