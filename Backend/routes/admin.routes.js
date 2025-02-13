const express = require("express");
const { loginAdmin, logoutAdmin, getAdminProfile } = require("../controllers/admin.controller");
const { getTotalRides, getTotalFare, getTotalDistance } = require("../controllers/admin.controller");
const { getAllUsers, getAllCaptains } = require("../controllers/admin.controller");
const adminAuthMiddleware = require("../middlewares/admin.auth.middleware");

const router = express.Router();

router.post("/login", loginAdmin);
router.get("/logout", logoutAdmin);
router.get("/profile", adminAuthMiddleware, getAdminProfile);
router.get("/total-rides", adminAuthMiddleware, getTotalRides);
router.get("/total-fare", adminAuthMiddleware, getTotalFare);
router.get("/total-distance", adminAuthMiddleware, getTotalDistance);
router.get("/users", adminAuthMiddleware, getAllUsers);

// Fetch all registered captains
router.get("/captains", adminAuthMiddleware, getAllCaptains);



module.exports = router;
