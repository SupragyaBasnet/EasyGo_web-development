const captainModel = require('../models/captain.model');

module.exports.createCaptain = async ({
    firstname, lastname, phonenumber,email, password, color, plate, capacity, vehicleType
}) => {
    // Validate required fields
    if (!firstname || !phonenumber || !email || !password || !color || !plate || !capacity || !vehicleType) {
        throw new Error('All fields are required');
    }

    // Create the captain document
    const captain = await captainModel.create({
        fullname: {
            firstname,
            lastname
        },
        phonenumber,
        email,
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
