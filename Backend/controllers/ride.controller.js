const rideService = require("../services/ride.service");
const { validationResult } = require("express-validator");
const mapService = require("../services/maps.service");
const { sendMessageToSocketId } = require("../socket");
const rideModel = require("../models/ride.model");



module.exports.createRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Debug: Check if req.user exists
  console.log("🔍 Debug: User from request:", req.user);

  if (!req.user) {
    return res
      .status(401)
      .json({ message: "Unauthorized: User not authenticated" });
  }

  const { pickup, destination, vehicleType } = req.body;

  try {
    // Create a ride
    const {ride, originCoord, destinationCoord } = await rideService.createRide({
      user: req.user._id, //  Ensure `req.user._id` exists
      pickup,
      destination,
      vehicleType,
    });

    // Get coordinates for pickup location
    const pickupCoordinates = originCoord;//await mapService.getAddressCoordinate(pickup);
    if (
      !pickupCoordinates ||
      !pickupCoordinates.lat ||
      !pickupCoordinates.lon
      ) {
        console.error(" Pickup coordinates not found");
        return;
    }
    console.log("pickup coord found " , originCoord);
      
    // Find captains nearby
    const captainsInRadius = await mapService.getCaptainsInTheRadius(
      pickupCoordinates.lat,
      pickupCoordinates.lon,
      2,
      vehicleType ,
      );

    res.status(201).json(captainsInRadius);
    if (!captainsInRadius.length) {
      console.log(" No captains found nearby");
      return;
    }

    ride.otp = "";

    const rideWithUser = await rideModel
      .findOne({ _id: ride._id })
      .populate("user");

    captainsInRadius.map((captain) => {
      sendMessageToSocketId(captain.socketId, {
        event: "new-ride",
        data: rideWithUser,
      });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports.getFare = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { pickup, destination } = req.query;

  console.log(" Received Fare Request:");
  console.log("Pickup:", pickup);
  console.log("Destination:", destination);

  try {
    const fare = await rideService.getFare(pickup, destination);
    console.log(" Calculated Fare:", fare);
    return res.status(200).json(fare);
  } catch (err) {
    console.error(" Error Calculating Fare:", err.message);
    return res.status(500).json({ message: err.message });
  }
};

module.exports.confirmRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId } = req.body;

  try {
    const ride = await rideService.confirmRide({
      rideId,
      captain: req.captain, // Ensure captain data is available
    });

    if (!ride.user || !ride.user.socketId) {
      return res.status(404).json({ message: "User not found or not connected" });
    }

    console.log("==========\n confirming ride \n==========", ride);
    // Emit "ride-confirmed" event with only one vehicleType
    sendMessageToSocketId(ride.user.socketId, {
      event: "ride-confirmed",
      data: {
        captain: {
          name: req.captain.name,
          phonenumber: req.captain.phonenumber,
          fullname: req.captain.fullname,
          profilePicture: req.captain.profilePicture || null,
          vehicle: req.captain.vehicle
        },
        // vehicleType: ride.vehicleType, // Only one occurrence
        fare: ride.fare,
        pickup: ride.pickup,
        destination: ride.pickup,
        distance: ride.distance ?? "Calculating...", //  Ensure distance is included
        duration: ride.duration ?? "Calculating...", 
        otp: 'XYZ4'
      },
    });

    return res.status(200).json({ message: "Ride confirmed", ride });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};







module.exports.startRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId, otp } = req.query;

  try {
    const ride = await rideService.startRide({
      rideId,
      otp,
      captain: req.captain,
    });

    console.log(ride);

    sendMessageToSocketId(ride.user.socketId, {
      event: "ride-started",
      data: ride,
    });

    return res.status(200).json(ride);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.endRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error("Validation errors:", errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { rideId } = req.body;

  try {
    console.log("Received endRide request for rideId:", rideId);

    // Check if ride exists before updating
    const ride = await rideService.endRide({ rideId, captain: req.captain });

    if (!ride) {
      console.error("Error: Ride not found in database");
      return res.status(404).json({ message: "Ride not found" });
    }

    if (!ride.user || !ride.user.socketId) {
      console.error("Error: Ride user or socketId missing");
      return res.status(500).json({ message: "Ride user not connected" });
    }

    sendMessageToSocketId(ride.user.socketId, {
      event: "ride-ended",
      data: ride,
    });

    console.log("Ride ended successfully:", ride);
    return res.status(200).json(ride);
  } catch (err) {
    console.error(" Backend Error ending ride:", err);
    return res.status(500).json({ message: err.message });
  }
};


