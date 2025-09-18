// File: backend/server.js
// Aapki file, aavashyak badlav ke saath.

// 1. dotenv hamesha sabse upar
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');
const path = require('path'); // Static files ke liye zaroori

// Apne route files ko import karein
const authRoute = require("./routes/authRoutes.js");
const reportRoute = require("./routes/reportRoutes.js");
const policeRoute = require("./routes/policeRoutes.js");


const app = express();

// 2. Middleware
app.use(cors());
app.use(express.json());

// 3. Database Connection
const MONGO_URI = process.env.MONGO_URI; 
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected successfully.'))
    .catch(err => console.error('MongoDB connection error:', err));

// 4. API Routes (Yeh hamesha static files se pehle aayenge)
app.use("/auth", authRoute);
app.use("/user", reportRoute);
app.use("/api/police", policeRoute);

// --- YEH HAI SABSE ZAROORI BADLAV ---
// 5. Static Frontend Files ko Serve Karna
// Yeh code API routes ke BAAD aur catch-all route se PEHLE hona chahiye.
const frontendBuildPath = path.resolve(__dirname, '../frontend/build');
app.use(express.static(path.join(__dirname, "../client/build")));
app.use(express.static(frontendBuildPath));


// 7. Server ko Start Karna
const PORT = process.env.PORT || 8080;
app.listen(PORT, ()=>{
    console.log(`Yes server is running on port no ${PORT}`);
});
