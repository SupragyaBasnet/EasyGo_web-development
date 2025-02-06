// const axios = require("axios");

// module.exports.getAddressCoordinate = async (address) => {
//   const sanitizeInput = (input) => input.replace(/['"]/g, " ").trim();
//   const defaultLocation = ", Kathmandu, Nepal";
//   const sanitizedAddress = sanitizeInput(address) + defaultLocation;

//   const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
//     sanitizedAddress
//   )}`;
//   const headers = { "User-Agent": "EasyGo/1.0 (supragyabasnet704@gmail.com)" };

//   console.log(`Original address: ${address}`);
//   console.log(`Sanitized address: ${sanitizedAddress}`);
//   console.log(`Requesting URL: ${url}`);

//   try {
//     const response = await axios.get(url, { headers });

//     if (response.data.length === 0) {
//       console.warn(`No results found for address: ${address}`);
//       return { error: "No results found. Try adding more details." };
//     }

//     const location = response.data[0];
//     return {
//       ltd: location.lat,
//       lng: location.lon,
//     };
//   } catch (error) {
//     console.error(
//       `Error fetching coordinates for address: ${address}`,
//       error.message
//     );
//     throw new Error("Unable to fetch coordinates. Please try again later.");
//   }
// };

// // Get suggestions for autocomplete
// module.exports.getAutoCompleteSuggestions = async (input) => {
//   const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
//     input
//   )}&addressdetails=1&limit=5`;

//   try {
//     const response = await axios.get(url);
//     return response.data.map((item) => item.display_name);
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// };

// // Convert distance from meters to km
// const formatDistance = (meters) => {
//   return {
//     text: `${(meters / 1000).toFixed(2)} km`,
//     value: meters,
//   };
// };

// // Convert duration from seconds to human-readable format
// const formatDuration = (seconds) => {
//   const days = Math.floor(seconds / (24 * 3600));
//   const hours = Math.floor((seconds % (24 * 3600)) / 3600);
//   const minutes = Math.floor((seconds % 3600) / 60);

//   let text = "";
//   if (days > 0) text += `${days} days `;
//   if (hours > 0) text += `${hours} hours `;
//   if (minutes > 0) text += `${minutes} minutes`;

//   return {
//     text: text.trim(),
//     value: seconds,
//   };
// };

// // Get distance and duration using OSRM
// module.exports.getDistanceTime = async (origin, destination) => {
//   if (!origin || !destination) {
//     throw new Error("Origin and destination are required");
//   }

//   try {
//     // Fetch coordinates for origin and destination
//     const originCoordinates = await module.exports.getAddressCoordinate(origin);
//     const destinationCoordinates = await module.exports.getAddressCoordinate(
//       destination
//     );

//     const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${originCoordinates.lng},${originCoordinates.ltd};${destinationCoordinates.lng},${destinationCoordinates.ltd}?overview=false`;

//     const response = await axios.get(osrmUrl);

//     if (response.data.routes && response.data.routes.length > 0) {
//       const route = response.data.routes[0];

//       return {
//         distance: formatDistance(route.distance), // Convert meters to km
//         duration: formatDuration(route.duration), // Convert seconds to human-readable format
//       };
//     } else {
//       throw new Error("No route data available");
//     }
//   } catch (error) {
//     console.error("Error fetching distance and time:", error.message);
//     throw error;
//   }
// };

const axios = require("axios");

module.exports.getAddressCoordinate = async (address) => {
  const sanitizeInput = (input) => input.replace(/['"]/g, " ").trim();
  const defaultLocation = ", Kathmandu, Nepal";
  const sanitizedAddress = sanitizeInput(address) + defaultLocation;

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    sanitizedAddress
  )}`;
  const headers = { "User-Agent": "EasyGo/1.0 (supragyabasnet704@gmail.com)" };

  console.log(`Original address: ${address}`);
  console.log(`Sanitized address: ${sanitizedAddress}`);
  console.log(`Requesting URL: ${url}`);

  try {
    const response = await axios.get(url, { headers });

    if (response.data.length === 0) {
      console.warn(`No results found for address: ${address}`);
      return { error: "No results found. Try adding more details." };
    }

    const location = response.data[0];
    return {
      ltd: location.lat,
      lng: location.lon,
    };
  } catch (error) {
    console.error(
      `Error fetching coordinates for address: ${address}`,
      error.message
    );
    throw new Error("Unable to fetch coordinates. Please try again later.");
  }
};

// Get structured suggestions for autocomplete
module.exports.getAutoCompleteSuggestions = async (input) => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    input
  )}&addressdetails=1&limit=5`;

  try {
    const response = await axios.get(url);
    if (!response.data || response.data.length === 0) {
      return { error: "No suggestions found. Try a more specific query." };
    }

    return response.data.map((item, index) => {
      // Matched substring (where the input matches in display_name)
      const matchOffset = item.display_name
        .toLowerCase()
        .indexOf(input.toLowerCase());
      const matchedSubstring = {
        length: input.length,
        offset: matchOffset !== -1 ? matchOffset : 0,
      };

      // Structured formatting (Main text: Name, Secondary text: Full address)
      const structuredFormatting = {
        main_text:
          item.address?.road ||
          item.address?.city ||
          item.address?.village ||
          item.address?.town ||
          item.address?.state ||
          item.address?.country,
        secondary_text: item.display_name,
      };

      // Split address into terms with offsets
      const terms = item.display_name.split(", ").map((term, i) => ({
        value: term,
        offset: item.display_name.indexOf(term),
      }));

      return {
        description: item.display_name, // Full formatted address
        matched_substrings: [matchedSubstring], // Matched substring position
        place_id: `place_${index + 1}`, // Simulated unique place ID
        reference: `ref_${index + 1}`, // Simulated reference
        structured_formatting: structuredFormatting, // Break down of place details
        terms: terms, // Address broken down with offsets
      };
    });
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
    // Fetch coordinates for origin and destination
    const originCoordinates = await module.exports.getAddressCoordinate(origin);
    const destinationCoordinates = await module.exports.getAddressCoordinate(
      destination
    );

    const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${originCoordinates.lng},${originCoordinates.ltd};${destinationCoordinates.lng},${destinationCoordinates.ltd}?overview=false`;

    const response = await axios.get(osrmUrl);

    if (response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0];

      return {
        distance: formatDistance(route.distance), // Convert meters to km
        duration: formatDuration(route.duration), // Convert seconds to human-readable format
      };
    } else {
      throw new Error("No route data available");
    }
  } catch (error) {
    console.error("Error fetching distance and time:", error.message);
    throw error;
  }
};
