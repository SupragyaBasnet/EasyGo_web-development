const axios = require("axios");
const captainModel = require('../models/captain.model');


module.exports.getAddressCoordinate = async (address) => {
  //  Step 1: Remove house numbers and ensure generic address format
  const sanitizedAddress = address
    .replace(/\d+,?/, "") // Removes leading numbers (house numbers)
    .replace(/['"]/g, " ") // Removes unnecessary quotes
    .trim();

  console.log(" Sanitized Address:", sanitizedAddress);

  //  Step 2: Fetch coordinates
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    sanitizedAddress
  )}&addressdetails=1&limit=1`;

  try {
    const response = await axios.get(url, {
      headers: { "User-Agent": "EasyGo/1.0 (supragyabasnet704@gmail.com)" },
    });

    //  Step 3: Ensure response contains valid data
    if (!response.data || response.data.length === 0) {
      console.error(" No results found for address:", sanitizedAddress);
      return null; // Return null instead of an error
    }

    console.log("Found Location Data");

    return { lat: response.data[0].lat, lon: response.data[0].lon };
  } catch (error) {
    console.error(" Error fetching coordinates:", error.message);
    return null; // Return null instead of throwing an error
  }
};


module.exports.getAutoCompleteSuggestions = async (input) => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    input
  )}&addressdetails=1&limit=5`;

  try {
    const response = await axios.get(url);
    if (!response.data || !Array.isArray(response.data)) {
      return [];
    }

    return response.data.map((item, index) => ({
      description: item.display_name,
      place_id: `place_${index + 1}`,
      structured_formatting: {
        main_text:
          item.address?.road || item.address?.city || item.address?.country,
        secondary_text: item.display_name,
      },
    }));
  } catch (error) {
    console.error("Error fetching autocomplete suggestions:", error.message);
    throw new Error("Unable to fetch suggestions. Please try again later.");
  }
};

// Convert distance from meters to km
const formatDistance = (meters) => {
  return {
    text: `${(meters / 1000).toFixed(2)} km`,
    value: meters,
  };
};

// Convert duration from seconds to human-readable format
const formatDuration = (seconds) => {
  const days = Math.floor(seconds / (24 * 3600));
  const hours = Math.floor((seconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  let text = "";
  if (days > 0) text += `${days} days `;
  if (hours > 0) text += `${hours} hours `;
  if (minutes > 0) text += `${minutes} minutes`;

  return {
    text: text.trim(),
    value: seconds,
  };
};

// Get distance and duration using OSRM
module.exports.getDistanceTime = async (origin, destination) => {
  if (!origin || !destination) {
    throw new Error("Origin and destination are required");
  }

  try {
    //  Fetch coordinates for origin and destination
    console.log("origin address: "+origin);
    const originCoordinates = await module.exports.getAddressCoordinate(origin);
    const destinationCoordinates = await module.exports.getAddressCoordinate(destination);

    //  Log the coordinates to debug the issue
    console.log("Origin Coordinates:", originCoordinates);
    console.log("Destination Coordinates:", destinationCoordinates);

    //  Ensure we got valid coordinates
    if (!originCoordinates || !destinationCoordinates) {
      throw new Error("Failed to get coordinates for locations.");
    }

    if (!originCoordinates.lon || !originCoordinates.lat || !destinationCoordinates.lon || !destinationCoordinates.lat) {
      throw new Error("Missing lat/lon data for locations.");
    }

    //  Ensure correct OSRM API format (longitude,latitude)
    const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${originCoordinates.lon},${originCoordinates.lat};${destinationCoordinates.lon},${destinationCoordinates.lat}?overview=false`;

    console.log(" OSRM Request URL:", osrmUrl);

    const response = await axios.get(osrmUrl);

    //  Check if we got a valid response
    if (!response.data || !response.data.routes || response.data.routes.length === 0) {
      throw new Error("No route data available.");
    }

    const route = response.data.routes[0];

    return {
      distance: {
        text: `${(route.distance / 1000).toFixed(2)} km`,
        value: route.distance,
      },
      duration: {
        text: `${Math.round(route.duration / 60)} mins`,
        value: route.duration,
      },
      originCoord: originCoordinates,
      destinationCoord: destinationCoordinates
      // distance: (route.distance/1000).toFixed(2),
      // duration: (route.duration/60).toFixed(2)
    };
  } catch (error) {
    console.error("Error fetching distance and time:", error.message);
    throw error;
  }
};


// Get nearby captains within a radius
module.exports.getCaptainsInTheRadius = async (latitude, longitude, radiusKm, vehicleType) => {
  try {
    // Convert radius from KM to Meters (MongoDB uses meters)
    const radiusMeters = radiusKm * 1000;

    // Ensure valid vehicle type selection
    const validVehicleTypes = ["car", "moto", "auto"];
    if (!validVehicleTypes.includes(vehicleType)) {
      console.log(`Invalid vehicle type: ${vehicleType}`);
      return [];
    }

    // MongoDB geospatial query to find captains within the radius
    const captains = await captainModel.find({
      // isAvailable: true, // ✅ Ensure captain is available for rides
      "vehicle.vehicleType": vehicleType, // ✅ Compare vehicle type dynamically
      location: {
        $nearSphere: {
          $geometry: { type: "Point", coordinates: [longitude, latitude] }, // ✅ [lng, lat] order
          $maxDistance: radiusMeters, // Convert km to meters
        },
      },
    });
    // await captainModel.find({
    //   location: {
    //     $near: {
    //       $geometry: {
    //         type: "Point",
    //         coordinates: [longitude, latitude], // MongoDB requires (lon, lat) format
    //       },
    //       $maxDistance: radiusMeters,
    //     },
    //   },
    // });
    console.log(captains);
    if (!captains.length) {
      console.log(`No available captains found nearby for vehicle type: ${vehicleType}`);
      return [];
    }

    console.log(`Found ${captains.length} captains nearby for vehicle type: ${vehicleType}`);

    return captains.map((captain) => ({
      _id: captain._id,
      name: captain.name,
      socketId: captain.socketId,
      vehicleType: captain.vehicleType,
      location: captain.location,
    }));
  } catch (error) {
    console.error(" Error fetching nearby captains:", error.message);
    return [];
  }
};