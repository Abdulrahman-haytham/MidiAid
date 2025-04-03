const jwt = require('jsonwebtoken');

const createToken = (id, type) => {
    return jwt.sign({ id, type }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

module.exports = createToken;
