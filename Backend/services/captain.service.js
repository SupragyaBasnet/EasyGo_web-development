const captainModel = require('../models/captain.model');

module.exports.createCaptain = async ({
    firstname, lastname, phonenumber, password, color, plate, capacity, vehicleType
}) => {
    // Validate required fields
    if (!firstname || !phonenumber || !password || !color || !plate || !capacity || !vehicleType) {
        throw new Error('All fields are required');
    }

    // Create the captain document
    const captain = await captainModel.create({
        fullname: {
            firstname,
            lastname
        },
        phonenumber,
        password,
        vehicle: {
            color,
            plate,
            capacity,
            vehicleType
        }
    });

    return captain;
};
