const otpService = require("../services/otp.service");
const emailService = require("../services/email.service");
const { validationResult } = require("express-validator");
const userModel = require("../models/user.model"); // Correct path to user model
const captainModel = require("../models/captain.model"); // Correct path to captain model


// Send OTP
module.exports.sendOtp = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error("Validation errors:", errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, userType } = req.body;
  const normalizedEmail = email.toLowerCase();
  const otp = otpService.generateOtp();

  try {
    console.log("Saving OTP for:", normalizedEmail);
    await otpService.saveOtp(normalizedEmail, otp);

    console.log("Sending OTP to:", normalizedEmail);
    await emailService.sendEmail(
      normalizedEmail,
      "Your OTP Code",
      `Your OTP is ${otp}. It will expire in 5 minutes.`
    );

    console.log("OTP sent successfully!");
    res.status(200).json({ message: "OTP sent successfully!" });
  } catch (error) {
    console.error("Error sending OTP:", error.message);
    res.status(500).json({ message: "Failed to send OTP.", error: error.message });
  }
};

// Verify OTP
module.exports.verifyOtp = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error("Validation errors:", errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, otp } = req.body;
  const normalizedEmail = email.toLowerCase();

  try {
    console.log("Verifying OTP for:", normalizedEmail);
    const isValidOtp = await otpService.verifyOtp(normalizedEmail, otp);

    if (!isValidOtp) {
      console.error("Invalid or expired OTP for:", normalizedEmail);
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    console.log("OTP verified successfully for:", normalizedEmail);
    res.status(200).json({ message: "OTP verified successfully!" });
  } catch (error) {
    console.error("Error verifying OTP:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Reset Password
module.exports.resetPassword = async (req, res) => {
  const { email, otp, password, userType } = req.body;
  const normalizedEmail = email.toLowerCase();

  try {
    console.log("Reset password request for:", normalizedEmail);

    // Verify OTP
    const isValidOtp = await otpService.verifyOtp(normalizedEmail, otp);
    if (!isValidOtp) {
      console.error("Invalid or expired OTP for:", normalizedEmail);
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    // Select the appropriate model based on userType
    const model = userType === "user" ? userModel : captainModel;
    console.log("Using model for userType:", userType);

    // Hash the new password
    const hashedPassword = await model.hashPassword(password);
    console.log("Password hashed successfully");

    // Update the password in the database
    const updatedUser = await model.findOneAndUpdate(
      { email: normalizedEmail },
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser) {
      console.error("User not found for email:", normalizedEmail);
      return res.status(404).json({ message: "User not found." });
    }

    console.log("Password reset successful for:", normalizedEmail);
    res.status(200).json({ message: "Password reset successfully!" });
  } catch (error) {
    console.error("Error during password reset:", error.message);
    res.status(500).json({ message: "Internal server error." });
  }
};
