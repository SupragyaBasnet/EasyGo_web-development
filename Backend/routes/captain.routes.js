const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const multer = require("multer");
const path = require("path");
const captainModel = require("../models/captain.model");

const authMiddleware = require("../middlewares/auth.middleware");
const captainController = require("../controllers/captain.controller");

// Multer setup (for handling file uploads)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Register route
router.post(
  "/register",
  [
    body("phonenumber")
      .isString()
      .matches(/^\d{10}$/)
      .withMessage("Phone number must be exactly 10 digits")
      .notEmpty()
      .withMessage("Phone number is required"),
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
    body("vehicle.name")
      .isLength({ min: 3 })
      .withMessage("Vehicle name must be at least 3 characters long"),
    body("vehicle.plate")
      .isLength({ min: 3 })
      .withMessage("Vehicle plate must be at least 3 characters long"),
    body("vehicle.capacity")
      .isInt({ min: 1 })
      .withMessage("Capacity must be at least 1"),
    body("vehicle.vehicleType")
      .isIn(["car", "motorcycle", "auto"])
      .withMessage("Invalid vehicle type"),
  ],
  captainController.registerCaptain
);

// Login route
router.post(
  "/login",
  [
    body("phonenumber")
      .isString()
      .matches(/^\d{10}$/)
      .withMessage("Phone number must be exactly 10 digits")
      .notEmpty()
      .withMessage("Phone number is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  captainController.loginCaptain
);

// Get captain profile
router.get("/profile", authMiddleware.authCaptain, captainController.getCaptainProfile);


// Upload profile picture
router.post(
  "/upload-profilePicture",
  authMiddleware.authCaptain,
  upload.single("profilePicture"),
  captainController.uploadProfilePicture
);



// Remove Profile Picture

router.put(
  "/remove-profile-picture",
  authMiddleware.authCaptain,
  captainController.removeProfilePicture
);




// Upload license
router.post(
  "/upload-license",
  authMiddleware.authCaptain,
  upload.single("license"),
  captainController.uploadLicense
);

// Update settings (language & night mode)
router.put("/update-settings", authMiddleware.authCaptain, captainController.updateSettings);

// Logout captain
router.get("/logout", authMiddleware.authCaptain, captainController.logoutCaptain);

// Delete account
router.delete("/delete", authMiddleware.authCaptain, captainController.deleteCaptain);

module.exports = router;
