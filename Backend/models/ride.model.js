// const mongoose = require("mongoose");

// const rideSchema = new mongoose.Schema({
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "user",
//     required: true,
//   },
//   captain: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "captain",
//   },
//   pickup: {
//     type: String,
//     required: true,
//   },
//   destination: {
//     type: String,
//     required: true,
//   },
//   fare: {
//     type: Number,
//     required: true,
//   },

//   status: {
//     type: String,
//     enum: ["pending", "accepted", "ongoing", "completed", "cancelled"],
//     default: "pending",
//   },

//   duration: {
//     type: Number,
//   }, // in seconds

//   distance: {
//     type: Number,
//   }, // in meters

//   paymentID: {
//     type: String,
//   },
//   orderId: {
//     type: String,
//   },
//   signature: {
//     type: String,
//   },

//   otp: {
//     type: String,
//     select: false,
//     required: true,
//   },
// });

// module.exports = mongoose.model("ride", rideSchema);

const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true }, // User reference
  captain: { type: mongoose.Schema.Types.ObjectId, ref: "captain" }, // Captain reference
  pickup: { type: String, required: true }, // Pickup location
  destination: { type: String, required: true }, // Destination
  fare: { type: Number, required: true }, // Fare for the ride
  status: {
    type: String,
    enum: ["pending", "accepted", "ongoing", "completed", "cancelled"],
    default: "pending",
  },
  duration: { type: Number,required: true }, // Duration in seconds
  distance: { type: Number,required: true }, // Distance in meters
  paymentID: { type: String }, // Payment ID from a payment gateway
  orderId: { type: String }, // Order ID
  signature: { type: String }, // Signature for payment verification
  otp: { type: String, select: false, required: true }, // OTP for ride verification
  createdAt: { type: Date, default: Date.now }, // Ride creation timestamp
});

module.exports = mongoose.model("ride", rideSchema);
