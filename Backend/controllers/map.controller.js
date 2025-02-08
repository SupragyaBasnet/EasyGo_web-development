const mapService = require("../services/maps.service");
const { validationResult } = require("express-validator");

module.exports.getCoordinates = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const coordinates = await mapService.getAddressCoordinate(
      req.query.address
    );
    res.status(200).json(coordinates);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch coordinates." });
  }
};

module.exports.getDistanceTime = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { origin, destination } = req.query;

  try {
    const distanceTime = await mapService.getDistanceTime(origin, destination);
    res.status(200).json(distanceTime);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to fetch distance and time",
      error: err.message,
    });
  }
};

// module.exports.getAutoCompleteSuggestions = async (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   const { input } = req.query;

//   try {
//     const suggestions = await mapService.getAutoCompleteSuggestions(input);
//     res.status(200).json(suggestions);
//   } catch (err) {
//     console.error(err);
//     res
//       .status(500)
//       .json({ message: "Failed to fetch suggestions", error: err.message });
//   }
// };
module.exports.getAutoCompleteSuggestions = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const suggestions = await mapService.getAutoCompleteSuggestions(
      req.query.input
    );
    res.status(200).json(suggestions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch suggestions." });
  }
};
