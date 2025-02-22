const express = require("express");
const adminAuthMiddleware = require("../middleware/admin.auth.middleware");
const {
  loginAdmin, logoutAdmin, getAdminProfile,
  getTotalRides, getTotalFare, getTotalDistance,
  getAllUsers, getAllCaptains
} = require("../controllers/admin.controller");


const router = express.Router();

router.post("/login", loginAdmin);
router.get("/logout", logoutAdmin);
router.get("/profile", adminAuthMiddleware, getAdminProfile);
router.get("/total-rides", adminAuthMiddleware, getTotalRides);
router.get("/total-fare", adminAuthMiddleware, getTotalFare);
router.get("/total-distance", adminAuthMiddleware, getTotalDistance);
router.get("/all-users", adminAuthMiddleware, getAllUsers);
router.get("/all-captains", adminAuthMiddleware, getAllCaptains);


module.exports = router;
