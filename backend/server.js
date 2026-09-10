require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");

// Connect to MongoDB
connectDB();

const app = express();

// ---- Core middleware ----
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json()); // parse JSON request bodies
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev")); // request logging in development
}

// ---- Health check ----
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Clinic Management API is running",
    timestamp: new Date().toISOString(),
  });
});

// ---- API routes ----
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/patients", require("./routes/patientRoutes"));
app.use("/api/doctors", require("./routes/doctorRoutes"));
app.use("/api/receptionists", require("./routes/receptionistRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/appointments", require("./routes/appointmentRoutes"));
app.use("/api/queue", require("./routes/queueRoutes"));
app.use("/api/consultations", require("./routes/consultationRoutes"));

// ---- Error handling (must be last) ----
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});
