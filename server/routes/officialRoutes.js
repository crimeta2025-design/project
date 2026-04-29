const express = require('express');
const router = express.Router();
const Report = require('../models/CrimeReports'); // Model rename kiya ho toh update kar lena
const { isAuthenticated } = require('../middleware/auth');

/**
 * @ROUTE   GET /api/official/reports
 * @DESC    Fetch reports based on Official's Department
 */
router.get('/reports', isAuthenticated, async (req, res) => {
    try {
        // Validation: Sirf Official aur Admin allow hain
        if (req.user.role !== 'official' && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied. Only officials allowed.' });
        }

        let query = {};

        // LOGIC: Agar Official hai toh sirf apne dept ki report dikhao
        // Agar Admin hai toh saari reports dikhao
        if (req.user.role === 'official') {
            query.department = req.user.department; 
        }

        const reports = await Report.find(query)
            .populate('reportedBy', 'name contact_number') 
            .sort({ priority: 1, createdAt: -1 }); // Priority (Critical first) then Newest

        res.json(reports);
    } catch (error) {
        console.error("Error fetching departmental reports:", error.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @ROUTE   GET /api/official/stats
 * @DESC    Get Department-specific dashboard stats
 */
router.get('/stats', isAuthenticated, async (req, res) => {
    try {
        if (req.user.role !== 'official' && req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied.' });
        }

        let query = {};
        if (req.user.role === 'official') {
            query.department = req.user.department;
        }

        // Stats Filter: Department ke hisaab se count
        const activeIssues = await Report.countDocuments({ 
            ...query, 
            status: { $in: ['new', 'in_progress'] } 
        });

        const resolvedToday = await Report.countDocuments({ 
            ...query,
            status: 'resolved',
            updatedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        });

        const criticalAlerts = await Report.countDocuments({ 
            ...query,
            priority: { $in: ['Critical', 'High'] }, 
            status: { $ne: 'resolved' } 
        });

        res.json({
            department: req.user.role === 'official' ? req.user.department : 'All City',
            activeIssues,
            resolvedToday,
            criticalAlerts,
            efficiencyRate: '85%' // Dummy logic for now
        });
    } catch (error) {
        console.error("Error fetching official stats:", error.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @ROUTE   PATCH /api/official/update-status/:id
 * @DESC    Official updates status of a report (Working logic)
 */
router.patch('/update-status/:id', isAuthenticated, async (req, res) => {
    try {
        const { status, adminComments } = req.body;
        
        const report = await Report.findById(req.params.id);
        if (!report) return res.status(404).json({ msg: 'Report not found' });

        // Security: Official sirf apne dept ki report update kare
        if (req.user.role === 'official' && report.department !== req.user.department) {
            return res.status(401).json({ msg: 'Not authorized for this department' });
        }

        report.status = status || report.status;
        report.adminComments = adminComments || report.adminComments;
        if(status === 'resolved') report.resolvedAt = Date.now();

        await report.save();
        res.json({ msg: 'Status Updated', report });

    } catch (error) {
        res.status(500).send('Update Error');
    }
});

module.exports = router;