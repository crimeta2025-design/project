const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const Report = require('../models/CrimeReports'); // Update model name if changed
const { isAuthenticated } = require('../middleware/auth');

// --- Cloudinary Configuration ---
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'city-resolve-reports',
        allowed_formats: ['jpeg', 'png', 'jpg', 'mp4'],
        resource_type: 'auto'
    },
});

const upload = multer({ storage: storage });

// --- Helper: Auto-assign Department & Priority ---
const getReportingDetails = (type) => {
    const mapping = {
        // Safety / Police
        'Women Safety SOS': { dept: 'Women_Safety_Unit', priority: 'Critical', cat: 'Safety' },
        'Harassment': { dept: 'Police', priority: 'High', cat: 'Safety' },
        'Theft/Burglary': { dept: 'Police', priority: 'High', cat: 'Safety' },
        
        // NMC Engineering
        'Potholes': { dept: 'NMC_Engineering', priority: 'Medium', cat: 'Infrastructure' },
        'Broken Footpath': { dept: 'NMC_Engineering', priority: 'Low', cat: 'Infrastructure' },
        
        // NMC Sanitation
        'Garbage Overflow': { dept: 'NMC_Sanitation', priority: 'Medium', cat: 'Sanitation' },
        'Clogged Drain': { dept: 'NMC_Sanitation', priority: 'High', cat: 'Sanitation' },
        
        // NMC Electrical/Water
        'Streetlight Not Working': { dept: 'NMC_Electrical', priority: 'Medium', cat: 'Utility' },
        'Water Leakage': { dept: 'NMC_Water', priority: 'High', cat: 'Utility' }
    };

    return mapping[type] || { dept: 'Police', priority: 'Low', cat: 'Other' };
};

// @route   POST /api/reports/create
router.post('/create', isAuthenticated, upload.array('evidenceFiles', 5), async (req, res) => {
    try {
        const { incidentType, locationAddress, latitude, longitude, incidentDate, description, isAnonymous, severity } = req.body;

        if (!incidentType || !locationAddress || !description) {
            return res.status(400).json({ msg: "Essential fields are missing." });
        }

        // Logic: Auto-get Dept and Priority
        const { dept, priority, cat } = getReportingDetails(incidentType);
        const evidenceUrls = req.files ? req.files.map(file => file.path) : [];

        const newReport = new Report({
            category: cat,
            incidentType,
            department: dept,
            priority: priority,
            severity: severity || 'Medium', // User's perceived severity
            locationAddress,
            location: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            incidentDate: incidentDate || Date.now(),
            description,
            evidenceUrls,
            isAnonymous: isAnonymous === 'true',
            reportedBy: isAnonymous === 'true' ? null : req.user.id,
        });

        await newReport.save();
        res.status(201).json({ msg: 'Issue reported successfully', report: newReport });

    } catch (error) {
        console.error("Report Creation Error:", error);
        res.status(500).json({ msg: `Server Error: ${error.message}` });
    }
});

// @route   GET /api/reports/overview (Dashboard Stats)
router.get('/overview', isAuthenticated, async (req, res) => {
    try {
        const stats = await Report.aggregate([
            {
                $facet: {
                    "counts": [
                        { $group: { 
                            _id: null, 
                            total: { $sum: 1 },
                            resolved: { $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] } },
                            active: { $sum: { $cond: [{ $in: ["$status", ["new", "in_progress"]] }, 1, 0] } }
                        }}
                    ],
                    "byDepartment": [
                        { $group: { _id: "$department", count: { $sum: 1 } } }
                    ],
                    "byPriority": [
                        { $group: { _id: "$priority", count: { $sum: 1 } } }
                    ]
                }
            }
        ]);

        res.json({
            summary: stats[0].counts[0] || { total: 0, resolved: 0, active: 0 },
            departmentWise: stats[0].byDepartment,
            priorityWise: stats[0].byPriority
        });
    } catch (error) {
        res.status(500).send('Stats Error');
    }
});

// @route   GET /api/reports/my-reports
router.get('/my-reports', isAuthenticated, async (req, res) => {
    try {
        const reports = await Report.find({ reportedBy: req.user.id }).sort({ createdAt: -1 });
        res.json(reports);
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;