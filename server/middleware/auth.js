const jwt = require('jsonwebtoken');
const User = require("../models/User.js");

exports.isAuthenticated = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, 'your_jwt_secret_key');
            req.user = await User.findById(decoded.user.id).select('-password');
            next();
        } catch (error) {
            return res.status(401).json({ msg: 'Not authorized, token failed' });
        }
    }
    if (!token) {
        return res.status(401).json({ msg: 'Not authorized, no token' });
    }
};

exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ msg: 'Access Denied. Sirf admin hi access kar sakta hai.' });
    }
};

exports.isPolice = (req, res, next) => {
    if (req.user && req.user.role === 'police') {
        next();
    } else {
        res.status(403).json({ msg: 'Access Denied. Sirf police personnel hi access kar sakte hain.' });
    }
};
