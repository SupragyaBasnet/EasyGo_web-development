const userModel = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const blackListTokenModel = require("../models/blackListToken.model");
const captainModel = require("../models/captain.model");

// module.exports.authUser = async (req, res, next) => {
//   try {
//     // Get token from cookie or Authorization header
//     const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

//     if (!token) {
//       return res
//         .status(401)
//         .json({ message: "Unauthorized: No token provided" });
//     }

//     // Check if the token is blacklisted (logged out)
//     const isBlacklisted = await blackListTokenModel.findOne({ token: token });
//     if (isBlacklisted) {
//       return res
//         .status(401)
//         .json({ message: "Unauthorized: Token is blacklisted" });
//     }

//     // Verify token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await userModel.findById(decoded._id);

//     // If user does not exist
//     if (!user) {
//       return res.status(401).json({ message: "Unauthorized: User not found" });
//     }

//     req.user = user; // ✅ Attach user to request
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: "Unauthorized: Invalid token" });
//   }
// };

module.exports.authUser = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Ensure correct token format

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded._id);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Authentication error:", err.message);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

// module.exports.authCaptain = async (req, res, next) => {
//   const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

//   if (!token) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }

//   const isBlacklisted = await blackListTokenModel.findOne({ token: token });

//   if (isBlacklisted) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const captain = await captainModel.findById(decoded._id);
//     req.captain = captain;

//     return next();
//   } catch (err) {
//     console.log(err);

//     res.status(401).json({ message: "Unauthorized" });
//   }
// };
module.exports.authCaptain = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ message: "Unauthorized" });
  }

  const isBlacklisted = await blackListTokenModel.findOne({ token });
  if (isBlacklisted) {
    console.log("Token is blacklisted");
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    const captain = await captainModel.findById(decoded._id);
    if (!captain) {
      console.log("Captain not found");
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.captain = captain;
    next();
  } catch (err) {
    console.error("Error during authentication:", err.message);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
