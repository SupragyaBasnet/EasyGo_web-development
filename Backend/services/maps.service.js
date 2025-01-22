const axios = require("axios");

module.exports.getAddressCoordinate = async (address) => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    address
  )}`;

  console.log(`Requesting URL: ${url}`); // Log the constructed URL

  try {
    const response = await axios.get(url);
    console.log("Response from Nominatim:", response.data); // Log the API response

    if (response.data && response.data.length > 0) {
      const location = response.data[0];
      return {
        ltd: location.lat,
        lng: location.lon,
      };
    } else {
      throw new Error("No results found");
    }
  } catch (error) {
    console.error("Error fetching coordinates:", error.message);
    throw error;
  }
};

// Get suggestions for autocomplete
module.exports.getAutoCompleteSuggestions = async (input) => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    input
  )}&addressdetails=1&limit=5`;

  try {
    const response = await axios.get(url);
    return response.data.map((item) => item.display_name);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Get distance and duration using OSRM
module.exports.getDistanceTime = async (origin, destination) => {
  if (!origin || !destination) {
    throw new Error("Origin and destination are required");
  }

  try {
    // Fetch coordinates for origin and destination
    const originCoordinates = await module.exports.getAddressCoordinate(origin);
    const destinationCoordinates = await module.exports.getAddressCoordinate(destination);

    const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${originCoordinates.lng},${originCoordinates.ltd};${destinationCoordinates.lng},${destinationCoordinates.ltd}?overview=false`;

    const response = await axios.get(osrmUrl);

    if (response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      return {
        distance: route.distance, // meters
        duration: route.duration  // seconds
      };
    } else {
      throw new Error("No route data available");
    }
  } catch (error) {
    console.error("Error fetching distance and time:", error.message);
    throw error;
  }
};
