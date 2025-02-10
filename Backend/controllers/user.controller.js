const userModel = require("../models/user.model");
const userService = require("../services/user.service");
const { validationResult } = require("express-validator");
const blackListTokenModel = require("../models/blackListToken.model");

module.exports.registerUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Validation errors:", errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { fullname, phonenumber, email, password } = req.body;

  try {
    // Check if the phone number already exists
    const isUserAlready = await userModel.findOne({
      $or: [{ phonenumber }, { email }],
    }).select("+password");

    if (isUserAlready) {
      console.log("User already exists with phone or email:", {
        phonenumber,
        email,
      });
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await userModel.hashPassword(password);
    console.log("Hashed Password:", hashedPassword);

    // Create the user
    const user = await userService.createUser({
      firstname: fullname.firstname,
      lastname: fullname.lastname,
      phonenumber,
      email,
      password: hashedPassword,
    });

    console.log("User registered successfully:", user);

    // Generate authentication token
    const token = user.generateAuthToken();

    res.status(201).json({ token, user });
  } catch (error) {
    console.error("Error during user registration:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.loginUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Validation errors:", errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { phonenumber, password } = req.body;

  try {
    // Find the user by phone number
    const user = await userModel.findOne({ phonenumber }).select("+password");
    if (!user) {
      console.log("User not found for phone number:", phonenumber);
      return res
        .status(401)
        .json({ message: "Invalid phone number or password" });
    }

    // Check if the password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log("Password mismatch for user:", phonenumber);
      return res
        .status(401)
        .json({ message: "Invalid phone number or password" });
    }

    // Generate the authentication token
    const token = user.generateAuthToken();
    console.log("Login successful for user:", phonenumber);

    // Set the token in a cookie
    res.cookie("token", token);

    // Return the token and user data
    res.status(200).json({ token, user });
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.getUserProfile = async (req, res, next) => {
  res.status(200).json(req.user);
};

module.exports.logoutUser = async (req, res, next) => {
  res.clearCookie("token");
  const token = req.cookies.token || req.headers.authorization.split(" ")[1];

  await blackListTokenModel.create({ token });

  res.status(200).json({ message: "Logout Successfully" });
};

// Add the updateProfile method here
module.exports.updateProfile = async (req, res) => {
  try {
    const { profilePicture, language, nightMode } = req.body;

    const user = await userModel.findByIdAndUpdate(
      req.user._id, // Get user ID from auth middleware
      { profilePicture, language, nightMode },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Profile updated", user });
  } catch (err) {
    console.error("Error updating profile:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
