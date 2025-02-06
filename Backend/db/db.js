const mongoose = require("mongoose");

const connectToDb = async () => {
  try {
    console.log(process.env.DB_CONNECT);
    await mongoose.connect(process.env.DB_CONNECT, {
      // No need for `useNewUrlParser` or `useUnifiedTopology`
    });
    console.log("Connected to DB");
  } catch (error) {
    console.error("Failed to connect to DB:", error.message);
    process.exit(1); // Exit process on failure
  }
};

module.exports = connectToDb;
