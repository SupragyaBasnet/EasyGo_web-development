const captainModel = require('../models/captain.model');
const captainService = require('../services/captain.service');
const blackListTokenModel = require('../models/blackListToken.model');
const { validationResult } = require('express-validator');


module.exports.registerCaptain = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    console.log("Received Data:", req.body);  // Debugging log

    const { fullname, phonenumber, email, password, vehicle } = req.body;

    // Ensure all required fields exist before proceeding
    if (!fullname || !fullname.firstname || !fullname.lastname || 
        !phonenumber || !email || !password || 
        !vehicle || !vehicle.name || !vehicle.plate || !vehicle.capacity || !vehicle.vehicleType) {
        
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Check if captain already exists
        const isCaptainAlreadyExist = await captainModel.findOne({
            $or: [{ phonenumber }, { email }]
        }).select('+password');

        if (isCaptainAlreadyExist) {
            return res.status(400).json({ message: 'Captain already exists' });
        }

        // Hash the password
        const hashedPassword = await captainModel.hashPassword(password);

        // Create the captain
        const captain = await captainService.createCaptain({
            firstname: fullname.firstname,
            lastname: fullname.lastname,
            phonenumber,
            email,
            password: hashedPassword,
            name: vehicle.name,
            plate: vehicle.plate,
            capacity: vehicle.capacity,
            vehicleType: vehicle.vehicleType
        });

        // Generate token
        const token = captain.generateAuthToken();

        res.status(201).json({ token, captain });
    } catch (error) {
        console.error("Error in registerCaptain:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports.loginCaptain = async (req, res, next) => {
    const { phonenumber, password } = req.body;

    console.log("Login request received for:", { phonenumber, password });

    try {
        const captain = await captainModel.findOne({ phonenumber }).select('+password');

        if (!captain) {
            console.log("Captain not found for phone number:", phonenumber);
            return res.status(401).json({ message: 'Invalid phone number or password' });
        }

        const isMatch = await captain.comparePassword(password);

        if (!isMatch) {
            console.log("Password mismatch for captain:", phonenumber);
            return res.status(401).json({ message: 'Invalid phone number or password' });
        }

        const token = captain.generateAuthToken();
        console.log("Login successful for captain:", phonenumber);

        res.cookie('token', token);
        return res.status(200).json({ token, captain });
    } catch (error) {
        console.error("Error during login:", error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports.getCaptainProfile = async (req, res, next) => {
    res.status(200).json({ captain: req.captain });
};

module.exports.logoutCaptain = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(400).json({ message: 'No token provided' });
    }

    // Blacklist the token
    await blackListTokenModel.create({ token });

    // Clear cookie
    res.clearCookie('token');

    res.status(200).json({ message: 'Logout successfully' });
};

module.exports.getCaptainProfile = async (req, res) => {
    try {
      console.log("Fetching captain details for:", req.captain?._id);
      const captain = await captainModel.findById(req.captain?._id);
  
      if (!captain) {
        console.log("Captain not found");
        return res.status(404).json({ message: "Captain not found" });
      }
  
      const profilePictureUrl = captain.profilePicture
        ? `${process.env.BASE_URL}${captain.profilePicture}`
        : "/uploads/default-avatar.jpeg"; // ✅ Ensure valid profile picture
  
      res.status(200).json({
        captain: {
          ...captain.toObject(),
          profilePicture: profilePictureUrl, // ✅ Always return profilePicture
        },
      });
    } catch (error) {
      console.error("Error fetching captain profile:", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

module.exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const captain = await captainModel.findById(req.captain._id);
    captain.profilePicture = `/uploads/${req.file.filename}`;
    await captain.save();
    res.status(200).json({
      message: "Profile picture uploaded successfully",
      profilePicture: captain.profilePicture,
    });
  } catch (error) {
    console.error("Error uploading profile picture:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.removeProfilePicture = async (req, res) => {
    try {
      const captain = await captainModel.findById(req.captain._id);
      if (!captain) {
        return res.status(404).json({ message: "Captain not found" });
      }
  
      // ✅ Reset profile picture to default
      captain.profilePicture = "/uploads/default-avatar.jpeg";
      await captain.save();
  
      res.status(200).json({
        message: "Profile picture removed successfully",
        profilePicture: captain.profilePicture, // ✅ Send updated profile picture
      });
    } catch (error) {
      console.error("Error removing profile picture:", error.message);
      res.status(500).json({ message: "Internal Server Error" });
    }
  };
  

module.exports.uploadLicense = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const captain = await captainModel.findById(req.captain._id);
    captain.license = `/uploads/${req.file.filename}`;
    await captain.save();
    res.status(200).json({
      message: "License uploaded successfully",
      captain,
    });
  } catch (error) {
    console.error("Error uploading license:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.updateSettings = async (req, res) => {
  try {
    const { language, nightMode } = req.body;
    const captain = await captainModel.findById(req.captain._id);
    captain.language = language;
    captain.nightMode = nightMode;
    await captain.save();
    res.status(200).json({ message: "Settings updated successfully" });
  } catch (error) {
    console.error("Error updating settings:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports.logoutCaptain = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
};

module.exports.deleteCaptain = async (req, res) => {
  try {
    await captainModel.findByIdAndDelete(req.captain._id);
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
