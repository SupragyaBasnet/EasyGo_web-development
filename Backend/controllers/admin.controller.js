const jwt = require("jsonwebtoken");
const Ride = require("../models/ride.model");
const userModel = require("../models/user.model");
const captainModel = require("../models/captain.model");


// Admin credentials (hardcoded)
const ADMIN_CREDENTIALS = {
  email: "admin@easygo.com",
  username: "admin",
  password: "EasyGo@123", // Strong password
};

// Login Admin
exports.loginAdmin = async (req, res) => {
  const { email, username, password } = req.body;

  // Check if all fields are provided
  if (!email || !username || !password) {
    return res.status(400).json({ message: "Email, username, and password are required" });
  }

  // Validate credentials
  if (
    email !== ADMIN_CREDENTIALS.email ||
    username !== ADMIN_CREDENTIALS.username ||
    password !== ADMIN_CREDENTIALS.password
  ) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Generate JWT token
  const token = jwt.sign(
    { email: ADMIN_CREDENTIALS.email, username: ADMIN_CREDENTIALS.username, role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  res.cookie("token", token, { httpOnly: true });
  res.status(200).json({ message: "Login successful", token });
};

// Logout Admin
exports.logoutAdmin = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful" });
};

// Get Admin Profile
exports.getAdminProfile = async (req, res) => {
  res.status(200).json({
    email: ADMIN_CREDENTIALS.email,
    username: ADMIN_CREDENTIALS.username,
  });
};
exports.getTotalRides = async (req, res) => {
  try {
    const rides = await Ride.aggregate([
      { $group: { _id: "$date", count: { $sum: 1 } } }
    ]);
    res.json(rides);
  } catch (error) {
    res.status(500).json({ message: "Error fetching total rides", error: error.message });
  }
};

// Fetch total fare grouped by date
exports.getTotalFare = async (req, res) => {
  try {
    const fares = await Ride.aggregate([
      { $group: { _id: "$date", amount: { $sum: "$fare" } } }
    ]);
    res.json(fares);
  } catch (error) {
    res.status(500).json({ message: "Error fetching total fare", error: error.message });
  }
};

// Fetch total distance grouped by vehicle type
exports.getTotalDistance = async (req, res) => {
  try {
    const distances = await Ride.aggregate([
      { $group: { _id: "$vehicleType", distance: { $sum: "$distance" } } }
    ]);
    res.json(distances);
  } catch (error) {
    res.status(500).json({ message: "Error fetching total distance", error: error.message });
  }
};

// Fetch all registered passengers
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

// Fetch all registered captains
exports.getAllCaptains = async (req, res) => {
  try {
    const captains = await Captain.find();
    res.status(200).json(captains);
  } catch (error) {
    res.status(500).json({ message: "Error fetching captains", error: error.message });
  }
};
