// File: backend/middleware/authMiddleware.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const isAuthenticated = async (req, res, next) => {
    let token;

    // 1. Check karein ki authorization header hai aur 'Bearer' se shuru hota hai
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 2. Header se token nikalein
            token = req.headers.authorization.split(' ')[1];

            // 3. Token ko secret key se verify karein
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 4. Token se user ki ID nikal kar use database me dhundhein
            req.user = await User.findById(decoded.user.id).select('-password');
            
            // 5. Agar user mil jaata hai, to request ko aage badhne dein
            if (req.user) {
                next();
            } else {
                return res.status(401).json({ msg: 'Not authorized, user not found' });
            }

        } catch (error) {
            // Yeh 'jwt.verify' ke errors (jaise invalid token ya expired token) ko pakdega
            console.error('Token verification error:', error.message);
            return res.status(401).json({ msg: 'Not authorized, token failed' });
        }
    } else {
        // Agar header me token hai hi nahi
        return res.status(401).json({ msg: 'Not authorized, no token provided' });
    }
};

module.exports = { isAuthenticated };


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
