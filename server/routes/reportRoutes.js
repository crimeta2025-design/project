

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const CrimeReport = require('../models/CrimeReports');
const { isAuthenticated } = require('../middleware/auth');

// --- Cloudinary Configuration ---
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    console.log("Cloudinary configured successfully!");
} else {
    console.error("!!! CLOUDINARY ENVIRONMENT VARIABLES NOT FOUND !!!");
    console.error("Please check your .env file.");
}


const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'crime-reports',
        allowed_formats: ['jpeg', 'png', 'jpg', 'mp4', 'mov', 'avi'],
        resource_type: 'auto'
    },
});

const upload = multer({ storage: storage });

const getSeverity = (incidentType) => {
    // ... aapka severity wala function ...
    switch (incidentType) {
        case 'Assault':
        case 'Domestic Violence':
        case 'Fraud':
            return 'High';
        case 'Theft/Burglary':
        case 'Drug Activity':
        case 'Harassment':
        case 'Suspicious Activity':
            return 'Medium';
        default:
            return 'Low';
    }
};

// ROUTE: POST /user/create
router.post('/create', isAuthenticated, upload.array('evidenceFiles', 5), async (req, res) => {
    console.log("--- '/user/create' route hit ---");
    console.log("Received Body:", req.body);
    console.log("Received Files:", req.files);

    try {
        const { 
            incidentType, 
            locationAddress, 
            latitude, 
            longitude, 
            incidentDate, 
            description, 
            isAnonymous 
        } = req.body;

        // Validation: Check karein ki zaroori fields hain ya nahi
        if (!incidentType || !locationAddress || !incidentDate || !description) {
            return res.status(400).json({ msg: "Please fill all required fields." });
        }

        const evidenceUrls = req.files ? req.files.map(file => file.path) : [];
        const severity = getSeverity(incidentType);

        const newReport = new CrimeReport({
            incidentType,
            severity,
            locationAddress,
            location: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            incidentDate,
            description,
            evidenceUrls,
            isAnonymous: isAnonymous === 'true',
            reportedBy: isAnonymous === 'true' ? null : req.user.id,
        });

        await newReport.save();

        res.status(201).json({ msg: 'Report created successfully', report: newReport });

    } catch (error) {
        // --- YEH HAI SABSE ZAROORI HISSA ---
        // Yeh backend ke asli error ko pakdega aur frontend ko bhejega
        console.error("!!! ERROR WHILE CREATING REPORT !!!");
        console.error(error); // Terminal me poora error print karega
        res.status(500).json({ msg: `Server Error: ${error.message}` });
    }
});

router.get('/my-reports', isAuthenticated, async (req, res) => {
    try {
        // User ki ID (jo token se aayi hai) ke aadhar par reports dhundho
        const reports = await CrimeReport.find({ reportedBy: req.user.id }).sort({ createdAt: -1 });
        res.json(reports);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
});

router.get('/all-reports', isAuthenticated, async (req, res) => {
    try {
        // Database se saari reports nikalo
        const reports = await CrimeReport.find({})
            .populate('reportedBy', 'name') // Agar reporter ka naam chahiye
            .sort({ createdAt: -1 });
        
        res.status(200).json(reports);
    } catch (error) {
        console.error("Error fetching all reports:", error.message);
        res.status(500).send('Server Error');
    }
});


router.get('/overview', isAuthenticated, async (req, res) => {
    try {
        const totalReports = await CrimeReport.countDocuments();
        const resolvedCases = await CrimeReport.countDocuments({ status: 'resolved' });
        const activeCases = await CrimeReport.countDocuments({ status: { $in: ['new', 'in_progress'] } });

        // Reports by Type ka data calculate karein
        const reportsByType = await CrimeReport.aggregate([
            { $group: { _id: '$incidentType', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.json({
            totalReports,
            resolvedCases,
            activeCases,
            reportsByType
        });
    } catch (error) {
        console.error("Error fetching stats:", error.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;


