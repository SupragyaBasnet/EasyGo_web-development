const express = require("express");
const { body } = require("express-validator");
const forgotPasswordController = require("../controllers/forgotPassword.controller");

const router = express.Router();

// Send OTP
router.post(
  "/send-otp",
  [
    body("email").isEmail().withMessage("Invalid email address."),
    body("userType").isIn(["user", "captain"]).withMessage("Invalid user type."),
  ],
  forgotPasswordController.sendOtp
);

// Verify OTP
router.post(
  "/verify-otp",
  [
    body("email").isEmail().withMessage("Invalid email address."),
    body("otp").isString().isLength({ min: 6, max: 6 }).withMessage("Invalid OTP."),
  ],
  forgotPasswordController.verifyOtp
);

// Reset Password
router.post(
  "/reset-password",
  [
    body("email").isEmail().withMessage("Invalid email address."),
    body("otp").isString().isLength({ min: 6, max: 6 }).withMessage("Invalid OTP."),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
    body("userType").isIn(["user", "captain"]).withMessage("Invalid user type."),
  ],
  forgotPasswordController.resetPassword
);

module.exports = router;
