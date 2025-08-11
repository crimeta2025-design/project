const express = require('express');
const router = express.Router();
const CrimeReport = require('../models/CrimeReports');
const { isAuthenticated } = require('../middleware/auth');

// ROUTE 1: GET /api/police/cases (Saare cases fetch karne ke liye)
router.get('/cases', isAuthenticated, async (req, res) => {
    try {
        // Yahan police aur admin, dono saare reports dekh sakte hain
        if (req.user.role !== 'police' && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied.' });
        }
        
        const cases = await CrimeReport.find({})
            .populate('reportedBy', 'name') // Reporter ka naam laane ke liye
            .sort({ createdAt: -1 }); // Sabse naye case pehle

        res.json(cases);
    } catch (error) {
        console.error("Error fetching police cases:", error.message);
        res.status(500).send('Server Error');
    }
});

// ROUTE 2: GET /api/police/stats (Dashboard stats ke liye)
router.get('/stats', isAuthenticated, async (req, res) => {
    try {
        if (req.user.role !== 'police' && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied.' });
        }

        const activeCases = await CrimeReport.countDocuments({ status: { $in: ['new', 'in_progress'] } });
        const resolvedToday = await CrimeReport.countDocuments({ 
            status: 'resolved',
            updatedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } // Aaj subah se
        });
        const highPriority = await CrimeReport.countDocuments({ severity: 'High', status: { $ne: 'resolved' } });

        // Response time ka calculation complex ho sakta hai, abhi ke liye dummy value
        const responseTime = '1.2h'; 

        res.json({
            activeCases,
            resolvedToday,
            highPriority,
            responseTime
        });
    } catch (error) {
        console.error("Error fetching police stats:", error.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
