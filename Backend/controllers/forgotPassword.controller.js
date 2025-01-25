const otpService = require("../services/otp.service");
const emailService = require("../services/email.service");
const userModel = require("../models/user.model");
const captainModel = require("../models/captain.model");
const { validationResult } = require("express-validator");

module.exports.sendOtp = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, userType } = req.body;
  const normalizedEmail = email.toLowerCase();
  const otp = otpService.generateOtp();

  try {
    await otpService.saveOtp(normalizedEmail, otp);
    await emailService.sendEmail(
      normalizedEmail,
      "Your OTP Code",
      `Your OTP is ${otp}. It will expire in 5 minutes.`
    );
    res.status(200).json({ message: "OTP sent successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to send OTP.", error: error.message });
  }
};

module.exports.verifyOtp = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, otp } = req.body;
  const normalizedEmail = email.toLowerCase();

  const isValidOtp = await otpService.verifyOtp(normalizedEmail, otp);
  if (!isValidOtp) return res.status(400).json({ message: "Invalid or expired OTP." });

  res.status(200).json({ message: "OTP verified successfully!" });
};

module.exports.resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, otp, password, userType } = req.body;
  const normalizedEmail = email.toLowerCase();

  const isValidOtp = await otpService.verifyOtp(normalizedEmail, otp);
  if (!isValidOtp) return res.status(400).json({ message: "Invalid or expired OTP." });

  const model = userType === "user" ? userModel : captainModel;
  const hashedPassword = await model.hashPassword(password);

  const updatedUser = await model.findOneAndUpdate({ email: normalizedEmail }, { password: hashedPassword });
  if (!updatedUser) return res.status(404).json({ message: "User not found." });

  res.status(200).json({ message: "Password reset successfully!" });
};
