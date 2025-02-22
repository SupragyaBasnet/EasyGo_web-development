const jwt = require("jsonwebtoken");
const Ride = require("../../models/ride.model");
const userModel = require("../../models/user.model");
const captainModel = require("../../models/captain.model");

// Admin credentials (hardcoded)
const ADMIN_CREDENTIALS = {
  email: "admin@easygo.com",
  username: "admin",
  password: "EasyGo@123",
};

// =============== Admin Login ================= //
exports.loginAdmin = async (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ message: "Email, username, and password are required" });
  }

  if (
    email !== ADMIN_CREDENTIALS.email ||
    username !== ADMIN_CREDENTIALS.username ||
    password !== ADMIN_CREDENTIALS.password
  ) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { email: ADMIN_CREDENTIALS.email, username: ADMIN_CREDENTIALS.username, role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "Strict" });
  res.status(200).json({ message: "Login successful", token });
};

// =============== Admin Logout ================= //
exports.logoutAdmin = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful" });
};

// =============== Fetch Admin Profile ================= //
exports.getAdminProfile = async (req, res) => {
  res.status(200).json({
    email: ADMIN_CREDENTIALS.email,
    username: ADMIN_CREDENTIALS.username,
  });
};

// =============== Fetch Total Rides by Date ================= //
exports.getTotalRides = async (req, res) => {
  try {
    const rides = await Ride.aggregate([
      { $group: { _id: null, count: { $sum: 1 } } }
    ]);
    res.json([{ count: rides.length > 0 ? rides[0].count : 0 }]);
  } catch (error) {
    res.status(500).json({ message: "Error fetching total rides", error: error.message });
  }
};

// =============== Fetch Total Fare by Date ================= //
exports.getTotalFare = async (req, res) => {
  try {
    const fares = await Ride.aggregate([
      { $group: { _id: null, amount: { $sum: "$fare" } } }
    ]);
    res.json([{ amount: fares.length > 0 ? fares[0].amount : 0 }]);
  } catch (error) {
    res.status(500).json({ message: "Error fetching total fare", error: error.message });
  }
};

// =============== Fetch Total Distance by Vehicle Type ================= //
exports.getTotalDistance = async (req, res) => {
  try {
    const distances = await Ride.aggregate([
      { $group: { _id: null, distance: { $sum: "$distance" } } }
    ]);
    res.json([{ distance: distances.length > 0 ? distances[0].distance : 0 }]);
  } catch (error) {
    res.status(500).json({ message: "Error fetching total distance", error: error.message });
  }
};


// =============== Fetch All Registered Users ================= //
exports.getAllUsers = async (req, res) => {
  try {
    console.log("Fetching all users...");
    const users = await userModel.find({});
    console.log("Users fetched:", users);
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// =============== Fetch All Registered Captains ================= //
exports.getAllCaptains = async (req, res) => {
  try {
    console.log("Fetching all captains...");

    // Fetch only required fields (excluding password)
    const captains = await captainModel.find({}, "-password").lean();

    // Ensure license path is included in the response
    const updatedCaptains = captains.map((captain) => ({
      _id: captain._id,
      fullname: captain.fullname,
      phonenumber: captain.phonenumber,
      email: captain.email,
      vehicle: captain.vehicle,
      license: captain.license || null, // Include license in response
    }));

    console.log("Captains fetched:", updatedCaptains);
    res.status(200).json(updatedCaptains);
  } catch (error) {
    console.error(" Error fetching captains:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


