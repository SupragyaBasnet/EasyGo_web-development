const twilio = require("twilio");
const crypto = require("crypto");
require("dotenv").config();

console.log("Twilio Config:");
console.log("Account SID:", process.env.TWILIO_ACCOUNT_SID);
console.log("Auth Token:", process.env.TWILIO_AUTH_TOKEN ? "Loaded" : "Missing");
console.log("Phone Number:", process.env.TWILIO_PHONE_NUMBER);

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

const otpStore = {}; // In-memory OTP store

module.exports.generateOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

module.exports.saveOtp = async (phonenumber, otp) => {
  otpStore[phonenumber] = { otp, createdAt: Date.now() };
  console.log(`OTP saved for ${phonenumber}: ${otp}`);
};
module.exports.verifyOtp = async (phonenumber, otp) => {
  const entry = otpStore[phonenumber];
  console.log(`OTP entry for ${phonenumber}:`, entry);

  if (!entry) {
    console.log("No OTP entry found.");
    return false;
  }

  const isExpired = Date.now() - entry.createdAt > 5 * 60 * 1000;
  if (isExpired) {
    console.log("OTP expired.");
    return false;
  }

  const isValid = entry.otp === otp;
  console.log("OTP validation result:", isValid);
  return isValid;
};

// module.exports.sendOtpToPhone = async (phonenumber, otp) => {
//   try {
//     await client.messages.create({
//       body: `Your EasyGo OTP is ${otp}. Please do not share it with anyone.`,
//       from: process.env.TWILIO_PHONE_NUMBER,
//       to: `+977${phonenumber}`,
//     });
//     console.log(`OTP ${otp} sent to phone number: ${phonenumber}`);
//   } catch (error) {
//     console.error("Failed to send OTP:", error.message);
//     throw new Error("Could not send OTP");
//   }
// };


module.exports.sendOtpToPhone = async (phonenumber, otp) => {
  const formattedPhoneNumber = `+977${phonenumber}`; // Ensure E.164 format for Nepal
  try {
    const message = await client.messages.create({
      body: `Your EasyGo OTP is ${otp}. Please do not share it with anyone.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+977${phonenumber}`,
    });
    console.log("OTP sent successfully. Message SID:", message.sid);
    console.log("Message status:", message.status); // Log the status
  } catch (error) {
    console.error("Failed to send OTP:", error.message);
    throw new Error("Failed to send OTP");
  }
};

