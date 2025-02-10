const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const captainSchema = new mongoose.Schema({
  fullname: {
    firstname: {
      type: String,
      required: true,
      minlength: [3, "Firstname must be at least 3 characters long"],
    },
    lastname: {
      type: String,
      required: true,
      minlength: [3, "Lastname must be at least 3 characters long"],
    },
  },
  phonenumber: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        return /^[0-9]{10}$/.test(v); // Exactly 10 digits
      },
      message: (props) =>
        `${props.value} is not a valid phone number! Must be 10 digits.`,
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email address!`,
    },
  },
  password: {
    type: String,
    required: true,
    select: false, // Prevent password from being returned by default
  },
  socketId: {
    type: String,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "inactive",
  },
  vehicle: {
    name: {
      type: String,
      required: true,
      minlength: [3, "Vehicle name must be at least 3 characters long"],
    },
    plate: {
      type: String,
      required: true,
      minlength: [3, "Vehicle plate must be at least 3 characters long"],
    },
    capacity: {
      type: Number,
      required: true,
      min: [1, "Vehicle capacity must be at least 1"],
    },
    vehicleType: {
      type: String,
      required: true,
      enum: ["car", "motorcycle", "auto"],
    },
  },
  location: {
    ltd: {
      type: Number,
    },
    lng: {
      type: Number,
    },
  },
  isActive: {
    type: Boolean,
    default: false, // Indicates whether the captain is active
  },
  profilePicture: { type: String, default: "/uploads/default-avatar.jpeg" },
  license: { type: String },
  language: { type: String, default: "en" },
  nightMode: { type: Boolean, default: false },
});

// Generate JWT
captainSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, phonenumber: this.phonenumber },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );
  return token;
};

// Compare Password
captainSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Hash Password
captainSchema.statics.hashPassword = async function (password) {
  return await bcrypt.hash(password, 10);
};

const captainModel = mongoose.model("Captain", captainSchema);

module.exports = captainModel;
