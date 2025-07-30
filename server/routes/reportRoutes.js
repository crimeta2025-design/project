const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const express = require('express');
const router = express.Router();
const isAuthenticated = require("../middleware/auth.js");

// --- ROUTE: POST /api/reports/create ---
router.post(
    '/create', 
   // isAuthenticated, 
    upload.single('crimeImage'), // 'crimeImage' field image  process
    async (req, res) => {
        try {
            const { latitude, longitude, description } = req.body;
            const imageFile = req.file;

            if (!imageFile || !latitude || !longitude) {
                return res.status(400).json({ msg: "Image and location are required." });
            }
            const imageUrl = `https://example.com/uploads/${Date.now()}_${imageFile.originalname}`;
            console.log("Image would be uploaded to:", imageUrl);


            // --- Nearest POLICE STATION  ---
            const userLocation = {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
            };

            
            const nearestPoliceStation = await User.findOne({
                role: 'police',
                status: 'approved',
                location: {
                    $near: {
                        $geometry: userLocation,
                        $maxDistance: 50000 // 50 km radius
                    }
                }
            });

            if (!nearestPoliceStation) {
                return res.status(404).json({ msg: "No nearby police station found." });
            }

            console.log("Nearest station found:", nearestPoliceStation.name);

            const newReport = new CrimeReport({
                reportedBy: req.user.id, 
                imageUrl: imageUrl,
                description: description,
                location: userLocation,
                assignedTo: nearestPoliceStation._id,
                status: 'new'
            });

            await newReport.save();

            res.status(201).json({
                msg: "Report successfully submitted!",
                report: newReport
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Server error while creating report." });
        }
    }
);

module.exports = router;