const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const app = express();
const cookieParser = require("cookie-parser");
const connectToDb = require("./db/db");
const userRoutes = require("./routes/user.routes");
const captainRoutes = require("./routes/captain.routes");
const mapsRoutes = require("./routes/maps.routes");
const rideRoutes = require("./routes/ride.routes");
const forgotPasswordRoutes = require("./routes/forgotPassword.routes");

connectToDb();

app.use(
  cors({
    origin: "http://localhost:5173", // Frontend URL
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed methods
    credentials: true, // Allow cookies
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/users", userRoutes);
app.use("/captains", captainRoutes);
app.use("/maps", mapsRoutes);
app.use("/rides", rideRoutes);
app.use("/api/forgot-password", forgotPasswordRoutes);

// Error Handling
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res
    .status(500)
    .json({ message: "Internal Server Error", error: err.message });
});

module.exports = app;
