const nodemailer = require("nodemailer");
require("dotenv").config();

// Configure transporter for nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT === "465", // Use secure if port is 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Function to send an email
module.exports.sendEmail = async (to, subject, text) => {
  try {
    console.log(`Attempting to send email to ${to} with subject "${subject}" and text: "${text}"`);
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to,
      subject,
      text,
    });
    console.log("Email sent successfully:", info.response);
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw new Error("Failed to send email. Please check the SMTP configuration.");
  }
};

// In-memory OTP store
const otpStore = {};

// Function to verify OTP
module.exports.verifyOtp = async (identifier, otp) => {
  const entry = otpStore[identifier];
  
  if (!entry) {
    console.log(`No OTP found for identifier: ${identifier}`);
    return false;
  }

  const isExpired = Date.now() - entry.createdAt > 5 * 60 * 1000; // Check if OTP is expired
  if (isExpired) {
    console.log(`OTP expired for identifier: ${identifier}`);
    delete otpStore[identifier]; // Cleanup expired OTP
    return false;
  }

  const isValid = entry.otp === otp;
  console.log(`OTP verification for identifier: ${identifier} - Valid: ${isValid}`);
  return isValid;
};

// Function to save OTP (helper for storing OTP in memory)
module.exports.saveOtp = async (identifier, otp) => {
  otpStore[identifier] = { otp, createdAt: Date.now() };
  console.log(`OTP saved for identifier: ${identifier}, OTP: ${otp}`);
};