require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// 3. Database Connection
const MONGO_URI = process.env.MONGO_URI;
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully."))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// 4. API Routes (Static serve se pehle aayenge)
const authRoute = require("./routes/authRoutes.js");
const reportRoute = require("./routes/reportRoutes.js");
const officialRoute = require("./routes/officialRoutes.js");

app.use("/auth", authRoute);
app.use("/user", reportRoute);
app.use("/api/official", officialRoute);

// 6. Server ko Start Karna
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
