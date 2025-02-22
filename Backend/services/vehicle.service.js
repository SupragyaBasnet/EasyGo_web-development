const captainModel = require("../models/captain.model");

const getVehicleAvailability = async () => {
  const vehicles = {
    car: { time: null, riders: 0 },
    moto: { time: null, riders: 0 },
    auto: { time: null, riders: 0 },
  };

  // Fetch active captains
  const captains = await captainModel.find({ isActive: true });

  console.log("Active Captains Found:", captains.length, captains); 

  captains.forEach((captain) => {
    console.log(`🔹 Processing Captain: ${captain._id} - VehicleType: ${captain.vehicle?.vehicleType}`);
    if (captain.vehicle?.vehicleType === "car") {
      vehicles.car.riders += 1;
      vehicles.car.time = "5"; // Placeholder
    } else if (captain.vehicle?.vehicleType === "moto") {
      vehicles.moto.riders += 1;
      vehicles.moto.time = "8";
    } else if (captain.vehicle?.vehicleType === "auto") {
      vehicles.auto.riders += 1;
      vehicles.auto.time = "10";
    }
  });

  // If no captains available, set default messages
  if (vehicles.car.riders === 0) vehicles.car.time = "No Captains";
  if (vehicles.moto.riders === 0) vehicles.moto.time = "No Captains";
  if (vehicles.auto.riders === 0) vehicles.auto.time = "No Captains";

  return vehicles;
};


module.exports = { getVehicleAvailability };
