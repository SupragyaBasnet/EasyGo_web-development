const crypto = require("crypto");
const otpStore = {};

module.exports.generateOtp = () => crypto.randomInt(100000, 999999).toString();

module.exports.saveOtp = async (identifier, otp) => {
  otpStore[identifier] = { otp, createdAt: Date.now() };
};

module.exports.verifyOtp = async (identifier, otp) => {
  const entry = otpStore[identifier];
  if (!entry) return false;

  const isExpired = Date.now() - entry.createdAt > 5 * 60 * 1000; // 5-minute expiry
  if (isExpired) {
    delete otpStore[identifier];
    return false;
  }

  return entry.otp === otp;
};
