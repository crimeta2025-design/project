const express = require("express");
const app = express();
const connectDB = require("./config/db.js");
connectDB();
const User = require("./models/User.js");
const authRoute = require("./routes/authRoutes.js");
const reportRoute = require("./routes/reportRoutes.js");
require("dotenv").config();
const JWT_KEY = process.env.JWT_SECRET;
const cors = require('cors'); 

app.use(express.json());
app.use(cors());


app.listen(8080, (req, res)=>{
    console.log("Yes server is running on port no 8080");
});

app.use("/auth", authRoute);
// app.use("/user");

