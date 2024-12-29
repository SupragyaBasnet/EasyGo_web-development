const mongoose = require('mongoose');

// Define the schema for the blacklisted token
const BlacklistedTokenSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // TTL set to 24 hours
  },
});

// Create the model from the schema
const BlacklistedToken = mongoose.model('BlacklistedToken', BlacklistedTokenSchema);

module.exports = BlacklistedToken;