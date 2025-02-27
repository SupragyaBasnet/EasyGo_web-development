const socketIo = require("socket.io");
const mongoose = require("mongoose");
const userModel = require("./models/user.model");
const captainModel = require("./models/captain.model");

let io;

function initializeSocket(server) {
  io = socketIo(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // JOIN EVENT - FIXED ID VALIDATION
    socket.on("join", async (data) => {
      const { userId, userType } = data;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        console.error("Invalid ObjectId:", userId);
        return socket.emit("error", { message: "Invalid user ID format" });
      }

      try {
        let user;
        if (userType === "user") {
          user = await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
        } else if (userType === "captain") {
          user = await captainModel.findByIdAndUpdate(userId, { socketId: socket.id });
        }

        if (!user) {
          return socket.emit("error", { message: `${userType} not found` });
        }

        // console.log(`${userType} with ID ${userId} joined.`);
      } catch (error) {
        console.error("Error updating socket ID:", error.message);
      }
    });

    // // CAPTAIN STATUS UPDATE
    // socket.on("captain-status-update", async () => {
    //   try {
    //     const captains = await captainModel.find({ isActive: true });
    //     const vehicleAvailability = {
    //       car: captains.filter((c) => c.vehicle?.vehicleType === "car").length,
    //       moto: captains.filter((c) => c.vehicle?.vehicleType === "moto").length,
    //       auto: captains.filter((c) => c.vehicle?.vehicleType === "auto").length,
    //     };
        
    //     // Send updated availability to all clients
    //     io.emit("vehicle-availability-update", vehicleAvailability);
    //   } catch (error) {
    //     console.error(" Error fetching captains:", error.message);
    //   }
    // });
  
    // //  CAPTAIN GOES ONLINE
    // socket.on("captain-online", async (data) => {
    //   try {
    //     const updatedCaptain = await captainModel.findOneAndUpdate(
    //       { _id: data.captainId },
    //       { $set: { isActive: true } },
    //       { new: true } //  Return updated captain
    //     );
  
    //     if (!updatedCaptain) {
    //       console.error(" Captain not found:", data.captainId);
    //       return;
    //     }
  
    //     console.log(`✅ Captain ${data.captainId} is now active:`, updatedCaptain);
  
    //     // Fetch updated availability
    //     const availability = await getVehicleAvailability();
    //     io.emit("vehicle-availability-update", availability);
    //   } catch (error) {
    //     console.error(" Error updating captain status:", error.message);
    //   }
    // });
  
    // //  Handle client disconnect
    // socket.on("disconnect", () => {
    //   console.log(" Client disconnected:", socket.id);
    // });

    

    //  NEW RIDE REQUEST
    socket.on("new-ride", (rideData) => {
      console.log("New ride request received:", rideData);
      io.emit("new-ride", rideData);
    });

    //  RIDE CONFIRMED - CHECK FOR `socketId`
    socket.on("ride-confirmed", (rideData) => {
      console.log("Ride confirmed:", rideData.ride.user.socketId);

      if (!rideData?.ride?.user?.socketId) {
        return console.error("Ride confirmed, but user socket ID is missing.");
      }
      // io.to(rideData.ride.user.socketId).emit("ride-confirmed", rideData.ride);
    });

    //  RIDE STARTED
    socket.on("ride-started", (rideData) => {
      if (!rideData?.user?.socketId) {
        return console.error("Ride started, but user socket ID is missing.");
      }
      console.log("Ride started:", rideData);
      io.to(rideData.user.socketId).emit("ride-started", rideData);
    });

    //  RIDE ENDED
    socket.on("ride-ended", (rideData) => {
      if (!rideData?.user?.socketId) {
        return console.error("Ride ended, but user socket ID is missing.");
      }
      console.log("Ride ended:", rideData);
      io.to(rideData.user.socketId).emit("ride-ended");
    });

    //  UPDATE LOCATION - CHECK FOR VALID ID
    socket.on("update-location-captain", async (data) => {
      // console.log("captain location", data);
      const { userId, location } = data;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return socket.emit("error", { message: "Invalid captain ID" });
      }

      if (!location || typeof location.ltd !== "number" || typeof location.lng !== "number") {
        return socket.emit("error", { message: "Invalid location data" });
      }

      try {
        await captainModel.findByIdAndUpdate(userId, {
          $set: {
            location: {
              type: "Point",
              coordinates: [location.lng, location.ltd], //  MongoDB expects [longitude, latitude]
            },
          },
        });
        // console.log(`Updated location for Captain ${userId}:`, location);
      } catch (error) {
        console.error("Error updating location:", error.message);
      }
    });

    //  HANDLE DISCONNECT
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}

//  FUNCTION TO SEND MESSAGE TO SPECIFIC SOCKET
const sendMessageToSocketId = (socketId, messageObject) => {
  console.log("Sending message to socket:", socketId, messageObject);
  if (io) {
    io.to(socketId).emit(messageObject.event, messageObject.data);
  } else {
    console.log("Socket.io not initialized.");
  }
};

module.exports = { initializeSocket, sendMessageToSocketId };
