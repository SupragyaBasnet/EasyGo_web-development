const captainController = require("../controllers/captain.controller");
const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authMiddleware = require("../middlewares/auth.middleware");

// Validation and routes for Captain

// Register route
router.post(
  "/register",
  [
    body("phonenumber")
      .isString()
      .matches(/^\d{10}$/) // Match exactly 10 digits
      .withMessage("Phone number must be exactly 10 digits")
      .notEmpty()
      .withMessage("Phone number is required"),
      body("email")
      .isEmail()
      .withMessage("Invalid email address"),
    body("fullname.firstname")
      .isLength({ min: 3 })
      .withMessage("First name must be at least 3 characters long"),
    body("fullname.lastname")
      .isLength({ min: 3 })
      .withMessage("Last name must be at least 3 characters long"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("vehicle.color")
      .isLength({ min: 3 })
      .withMessage("Color must be at least 3 characters long"),
    body("vehicle.plate")
      .isLength({ min: 3 })
      .withMessage("Plate must be at least 3 characters long"),
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
      .matches(/^\d{10}$/) // Match exactly 10 digits
      .withMessage("Phone number must be exactly 10 digits")
      .notEmpty()
      .withMessage("Phone number is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  captainController.loginCaptain
);

// Profile route
router.get(
  "/profile",
  authMiddleware.authCaptain,
  captainController.getCaptainProfile
);

// Logout route
router.get(
  "/logout",
  authMiddleware.authCaptain,
  captainController.logoutCaptain
);

module.exports = router;
