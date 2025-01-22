const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const forgotPasswordController = require("../controllers/forgotPassword.controller");

router.post(
  "/send-otp",
  [body("phonenumber").isString().matches(/^\d{10}$/).withMessage("Invalid phone number.")],
  forgotPasswordController.sendOtp
);

router.post(
  "/reset-password",
  [
    body("phonenumber").isString().matches(/^\d{10}$/).withMessage("Invalid phone number."),
    body("otp").isString().isLength({ min: 6, max: 6 }).withMessage("Invalid OTP."),
    body("password").isString().isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
    body("userType").isIn(["user", "captain"]).withMessage("Invalid user type."),
  ],
  forgotPasswordController.resetPassword
);

module.exports = router;
