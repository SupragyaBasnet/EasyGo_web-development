const otpService = require("../services/otp.service");
const userModel = require("../models/user.model");
const captainModel = require("../models/captain.model");
const { validationResult } = require("express-validator");

// module.exports.sendOtp = async (req, res) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   const { phonenumber } = req.body;
//   const otp = otpService.generateOtp();

//   try {
//     await otpService.saveOtp(phonenumber, otp);
//     await otpService.sendOtpToPhone(phonenumber, otp);
//     res.status(200).json({ message: "OTP sent successfully." });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to send OTP.", error: err.message });
//   }
// };


module.exports.sendOtp = async (req, res) => {
  const { phonenumber } = req.body;

  // Generate OTP
  const otp = otpService.generateOtp();

  try {
    // Save OTP and send to phone
    await otpService.saveOtp(phonenumber, otp);
    await otpService.sendOtpToPhone(phonenumber, otp);

    res.status(200).json({ message: "OTP sent successfully." });
  } catch (error) {
    console.error("Failed to send OTP:", error.message);
    res.status(500).json({ message: "Failed to send OTP.", error: error.message });
  }
};

module.exports.resetPassword = async (req, res) => {
  console.log("Incoming reset password request:", req.body);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Validation errors:", errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { phonenumber, otp, password, userType } = req.body;
  try {
    console.log(`Verifying OTP for ${phonenumber}...`);
    const isValidOtp = await otpService.verifyOtp(phonenumber, otp);

    if (!isValidOtp) {
      console.log("Invalid or expired OTP:", otp);
      return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    console.log(`OTP verified. Updating password for ${phonenumber}. User type: ${userType}`);
    const model = userType === "user" ? userModel : captainModel;

    const hashedPassword = await model.hashPassword(password);
    console.log("Password hashed successfully.");

    const updatedUser = await model.findOneAndUpdate(
      { phonenumber },
      { password: hashedPassword }
    );
    console.log("Update result:", updatedUser);
    if (!updatedUser) {
      console.log("User not found with phone number:", phonenumber);
      return res.status(404).json({ message: "User not found." });
    }

    console.log("Password reset successful for:", phonenumber);
    res.status(200).json({ message: "Password reset successfully." });
  } catch (err) {
    console.error("Error resetting password:", err);
    res.status(500).json({ message: "Failed to reset password.", error: err.message });
  }
};
