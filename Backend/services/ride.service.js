const rideModel = require("../models/ride.model");
const mapService = require("./maps.service");
const bcrypt = require("bcrypt");
const crypto = require("crypto");


async function getFare(pickup, destination) {
  if (!pickup || !destination) {
    throw new Error("Pickup and destination are required");
  }

  const distanceTime = await mapService.getDistanceTime(pickup, destination);

  if (!distanceTime || !distanceTime.distance || !distanceTime.duration) {
    throw new Error("Could not calculate distance and time");
  }

  console.log("📏 Distance & Time:", distanceTime);

  const baseFare = { auto: 70, car: 150, moto: 60 };
  const perKmRate = { auto: 22, car: 55, moto: 35 };
  const perMinuteRate = { auto: 6, car: 10, moto: 6 };
  const minimumFare = { auto: 180, car: 300, moto: 150 };

  const distanceKm = distanceTime.distance.value / 1000;
  const durationMin = distanceTime.duration.value / 60;

  const fare = {
    auto: parseFloat(
      Math.max(
        minimumFare.auto,
        baseFare.auto + distanceKm * perKmRate.auto + durationMin * perMinuteRate.auto
      ).toFixed(2)
    ),
    car: parseFloat(
      Math.max(
        minimumFare.car,
        baseFare.car + distanceKm * perKmRate.car + durationMin * perMinuteRate.car
      ).toFixed(2)
    ),
    moto: parseFloat(
      Math.max(
        minimumFare.moto,
        baseFare.moto + distanceKm * perKmRate.moto + durationMin * perMinuteRate.moto
      ).toFixed(2)
    ),
    distanceAway: distanceKm.toFixed(2)
  };

  console.log("Final Fare Calculated:", fare);

  return fare;
}

module.exports.getFare = getFare;

function getOtp(num) {
  function generateOtp(num) {
    const otp = crypto
      .randomInt(Math.pow(10, num - 1), Math.pow(10, num))
      .toString();
    return otp;
  }
  return generateOtp(num);
}

// module.exports.createRide = async ({
//   user,
//   pickup,
//   destination,
//   vehicleType,
// }) => {
//   if (!user || !pickup || !destination || !vehicleType) {
//     throw new Error("All fields are required");
//   }

//   const fare = await getFare(pickup, destination);

//   const ride = rideModel.create({
//     user,
//     pickup,
//     destination,
//     otp: getOtp(6),
//     fare: fare[vehicleType],
//   });

//   return ride;
// };
module.exports.createRide = async ({ user, pickup, destination, vehicleType }) => {
  const fare = await getFare(pickup, destination);
  console.log("\n\n\n\n\n CREATE RIDE STARTED ======\n\n\n\n");
  const { distance, duration, originCoord, destinationCoord } = await mapService.getDistanceTime(pickup, destination); // Assuming a function to fetch these values

  const ride = await rideModel.create({
    user,
    pickup,
    destination,
    vehicleType,
    fare: fare[vehicleType],
    otp: getOtp(4),
    distance: (distance.value/1000).toFixed(2),
    duration: (duration.value/60).toFixed(2),
    distanceAway,
    // status: "pending",
  });
  console.log("Created Ride:", ride);

  return {ride, originCoord, destinationCoord};
};


module.exports.confirmRide = async ({ rideId, captain }) => {
  if (!rideId) {
    throw new Error("Ride id is required");
  }

  console.log("\n\n\nrideid, captain ", rideId, captain);
  const ride = await rideModel.findOneAndUpdate(
    {
      _id: rideId,
    }
    
    ,
    {
      status: "accepted",
      captain: captain._id,
      
    }
  ).populate("user");

  // const ride = await rideModel
  //   .findOne({
  //     _id: rideId,
  //   })
  //   .populate("user")
  //   .populate("captain")
  //   .select("+otp");

  if (!ride) {
    throw new Error("Ride not found");
  }

  return ride;
};

module.exports.startRide = async ({ rideId, otp, captain }) => {
  if (!rideId || !otp) {
    throw new Error("Ride id and OTP are required");
  }

  const ride = await rideModel
    .findOne({
      _id: rideId,
    })
    .populate("user")
    .populate("captain")
    .select("+otp");

  if (!ride) {
    throw new Error("Ride not found");
  }

  if (ride.status !== "accepted") {
    throw new Error("Ride not accepted");
  }

  if (ride.otp !== otp) {
    throw new Error("Invalid OTP");
  }

  await rideModel.findOneAndUpdate(
    {
      _id: rideId,
    },
    {
      status: "ongoing",
    }
  );

  return ride;
};

module.exports.endRide = async ({ rideId, captain }) => {
  if (!rideId) {
    throw new Error("Ride id is required");
  }

  const ride = await rideModel
    .findOne({
      _id: rideId,
      captain: captain._id,
    })
    .populate("user")
    .populate("captain")
    .select("+otp");

  if (!ride) {
    throw new Error("Ride not found");
  }

  if (ride.status !== "accepted") {
    throw new Error("Ride not accepted");
  }

  await rideModel.findOneAndUpdate(
    {
      _id: rideId,
    },
    {
      status: "completed",
    }
  );

  return ride;
};
