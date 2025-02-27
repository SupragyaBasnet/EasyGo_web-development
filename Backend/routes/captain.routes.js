const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const upload = require("../middlewares/upload.middleware");
const authMiddleware = require("../middlewares/auth.middleware");
const captainController = require("../controllers/captain.controller");


router.post(
  "/register",
  [
    body("phonenumber")
      .isString()
      .matches(/^\d{10}$/)
      .withMessage("Phone number must be exactly 10 digits")
      .notEmpty()
      .withMessage("Phone number is required"),
    body("email").isEmail().withMessage("Invalid email address"),
    body("fullname.firstname")
      .isLength({ min: 3 })
      .withMessage("First name must be at least 3 characters long"),
    body("fullname.lastname")
      .isLength({ min: 3 })
      .withMessage("Last name must be at least 3 characters long"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("vehicle.name")
      .isLength({ min: 3 })
      .withMessage("Vehicle name must be at least 3 characters long"),
    body("vehicle.plate")
      .isLength({ min: 3 })
      .withMessage("Vehicle plate must be at least 3 characters long"),
    body("vehicle.capacity")
      .isInt({ min: 1 })
      .withMessage("Capacity must be at least 1"),
    body("vehicle.vehicleType")
      .isIn(["car", "moto", "auto"])
      .withMessage("Invalid vehicle type"),
  ],
  captainController.registerCaptain
);

// Login route
router.post(
  "/login",
  [
    body("phonenumber")
      .isString()
      .matches(/^\d{10}$/)
      .withMessage("Phone number must be exactly 10 digits")
      .notEmpty()
      .withMessage("Phone number is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  captainController.loginCaptain
);

router.get("/profile", authMiddleware.authCaptain, captainController.getCaptainProfile);


// Profile Picture Routes
router.post(
  "/upload-profilePicture",
  authMiddleware.authCaptain,
  upload.single("profilePicture"),
  captainController.uploadProfilePicture
);

router.put(
  "/remove-profilePicture",
  authMiddleware.authCaptain,
  captainController.removeProfilePicture
);

router.post("/upload-license", authMiddleware.authCaptain, upload.single("licensePicture"), captainController.uploadLicense);
router.put("/update-settings", authMiddleware.authCaptain, captainController.updateSettings);
router.get("/logout", authMiddleware.authCaptain, captainController.logoutCaptain);
router.delete("/delete", authMiddleware.authCaptain, captainController.deleteCaptain);



module.exports = router;
