// =======================================================
// FILE: routes/adminRoutes.js (Example of protected route)
// =======================================================
const express = require('express');
const router = express.Router();
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');
const User = require('../models/User');

router.get('/pending-requests', isAuthenticated, isAdmin, async (req, res) => {
    const pendingUsers = await User.find({ status: 'pending', role: 'police' });
    res.json(pendingUsers);
});

router.patch('/approve-user/:id', isAuthenticated, isAdmin, async (req, res) => {
    await User.findByIdAndUpdate(req.params.id, { status: 'approved' });
    res.json({ msg: 'User has been approved.' });
});

module.exports = router;