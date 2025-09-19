// File: backend/server.js

// 1. dotenv hamesha sabse upar
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();

// 2. Middleware
app.use(cors());
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
const policeRoute = require("./routes/policeRoutes.js");

app.use("/auth", authRoute);
app.use("/user", reportRoute);
app.use("/api/police", policeRoute);

// 5. Static Frontend Files ko Serve Karna
// Agar tum frontend alag Render Static Site par host kar rahe ho, 
// toh ye part hata bhi sakte ho.
// Agar same backend se serve karna ho to rakho:
const clientBuildPath = path.join(__dirname, "../client/build");
if (process.env.NODE_ENV === "production") {
  app.use(express.static(clientBuildPath));

  // React ke liye catch-all route
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(clientBuildPath, "index.html"));
  });
}

// 6. Server ko Start Karna
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
