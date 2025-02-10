const express = require("express");
const { body } = require("express-validator");
const multer = require("multer");
const path = require("path");
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const rideModel = require("../models/ride.model");
const userModel = require("../models/user.model");
const sharp = require("sharp");
const router = express.Router();

// =======================
// Multer Storage Configuration
// =======================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profile-pictures/"); // Directory to store uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user._id}_${Date.now()}${path.extname(file.originalname)}`); // File naming format
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Restrict file type to images only
    const fileTypes = /jpeg|jpg|png/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed!"));
    }
  },
});

// =======================
// Register User
// =======================
router.post(
  "/register",
  [
    body("phonenumber")
      .notEmpty()
      .withMessage("Phone number is required")
      .isString()
      .withMessage("Phone number must be a string")
      .matches(/^\d{10}$/)
      .withMessage("Phone number must be exactly 10 digits"),
    body("email").isEmail().withMessage("Invalid email address"),
    body("fullname.firstname")
      .isLength({ min: 3 })
      .withMessage("First name must be at least 3 characters long"),
    body("fullname.lastname")
      .isLength({ min: 3 })
      .withMessage("Last name must be at least 3 characters long"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  userController.registerUser
);

// =======================
// Login User
// =======================
router.post(
  "/login",
  [
    body("phonenumber")
      .notEmpty()
      .withMessage("Phone number is required")
      .isString()
      .withMessage("Phone number must be a string")
      .matches(/^\d{10}$/)
      .withMessage("Phone number must be exactly 10 digits"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  userController.loginUser
);

// =======================
// Get User Profile
// =======================
router.get("/profile", authMiddleware.authUser, userController.getUserProfile);

// =======================
// Logout User
// =======================
router.get("/logout", authMiddleware.authUser, userController.logoutUser);

// =======================
// Profile Picture Upload
// =======================
router.post(
  "/upload-profile-picture",
  authMiddleware.authUser,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const mimeType = req.file.mimetype.split("/")[1]; // Get the file extension (e.g., 'jpeg', 'png')
      const outputPath = `uploads/profile-pictures/${req.user._id}_${Date.now()}.${mimeType}`;

      // Resize and save in the original format
      await sharp(req.file.path)
        .resize(256, 256, { fit: "cover" })
        .toFile(outputPath);

      const user = await userModel.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.profilePicture = `/${outputPath}`;
      await user.save();

      res.status(200).json({ message: "Profile picture updated", user });
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }
);

// =======================
// Update Settings (Language & Night Mode)
// =======================
router.put("/update-settings", authMiddleware.authUser, async (req, res) => {
  const { language, nightMode } = req.body;

  try {
    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.language = language || user.language;
    user.nightMode = nightMode ?? user.nightMode;
    await user.save();

    res.status(200).json({ message: "Settings updated", user });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// =======================
// Ride History
// =======================
router.get("/ride-history", authMiddleware.authUser, async (req, res) => {
  try {
    const rideHistory = await rideModel.find({ user: req.user._id }).sort({ date: -1 });
    res.status(200).json(rideHistory);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});
// Remove Profile Picture Endpoint
router.put("/remove-profile-picture", authMiddleware.authUser, async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Reset profile picture to default
    user.profilePicture = "/path/to/default/image.jpeg"; // Default profile image path
    await user.save();

    res.status(200).json({ message: "Profile picture removed", user });
  } catch (error) {
    console.error("Error removing profile picture:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.delete("/delete", authMiddleware.authUser, async (req, res) => {
  try {
    const user = await userModel.findByIdAndDelete(req.user._id); // Deletes the user by their ID
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});


// =======================
// Update Profile (Profile Picture + Settings Combined)
// =======================
router.put(
  "/update-profile",
  authMiddleware.authUser,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      const { language, nightMode } = req.body;
      const user = await userModel.findById(req.user._id);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (req.file) {
        user.profilePicture = `/uploads/profile-pictures/${req.file.filename}`;
      }

      user.language = language || user.language;
      user.nightMode = nightMode ?? user.nightMode;
      await user.save();

      res.status(200).json({ message: "Profile updated", user });
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  }
);

module.exports = router;
