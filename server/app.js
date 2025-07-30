const express = require("express");
const app = express();
const mongoose = require("mongoose");
const User = require("./models/User.js");
const authRoute = require("./routes/authRoutes.js");
const reportRoute = require("./routes/reportRoutes.js");
require("dotenv").config();
const JWT_KEY = process.env.JWT_SECRET;
const cors = require('cors'); 

app.use(express.json());
app.use(cors());


// DB Connection
const MONGO_URI = process.env.MONGO_URI; 
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected successfully.'))
    .catch(err => console.error('MongoDB connection error:', err));

app.listen(8080, (req, res)=>{
    console.log("Yes server is running on port no 8080");
});

app.use("/auth", authRoute);
// app.use("/user");

