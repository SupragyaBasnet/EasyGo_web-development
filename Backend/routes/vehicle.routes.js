const express = require("express");
const { getVehicleAvailability } = require("../services/vehicle.service");
const router = express.Router();

// Endpoint for vehicle availability
router.get("/availability", async (req, res) => {
  try {
    const availability = await getVehicleAvailability();
    res.status(200).json(availability);
  } catch (error) {
    console.error("Error fetching vehicle availability:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
