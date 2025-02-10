const captainModel = require("../models/captain.model");

const getVehicleAvailability = async () => {
  const vehicles = {
    car: { time: "Calculating...", riders: 0 },
    moto: { time: "Calculating...", riders: 0 },
    auto: { time: "Calculating...", riders: 0 },
  };

  const captains = await captainModel.find({ isActive: true });

  captains.forEach((captain) => {
    if (captain.vehicleType === "car") {
      vehicles.car.riders += 1;
    } else if (captain.vehicleType === "moto") {
      vehicles.moto.riders += 1;
    } else if (captain.vehicleType === "auto") {
      vehicles.auto.riders += 1;
    }
  });

  return vehicles;
};

module.exports = { getVehicleAvailability };
