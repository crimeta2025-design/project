// File: backend/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const isAuthenticated = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.user.id).select('-password');
            
            if (req.user) {
                next();
            } else {
                return res.status(401).json({ msg: 'Not authorized, user not found' });
            }

        } catch (error) {
            console.error('Token verification error:', error.message);
            return res.status(401).json({ msg: 'Not authorized, token failed' });
        }
    } else {
        return res.status(401).json({ msg: 'Not authorized, no token provided' });
    }
};

module.exports = { isAuthenticated };


exports.isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ msg: 'Access Denied.' });
    }
};

exports.isPolice = (req, res, next) => {
    if (req.user && req.user.role === 'police') {
        next();
    } else {
        res.status(403).json({ msg: 'Access Denied. ' });
    }
};
