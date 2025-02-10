const captainModel = require('../models/captain.model');

module.exports.createCaptain = async ({
    firstname, lastname, phonenumber,email, password, name, plate, capacity, vehicleType
}) => {
    // Validate required fields
    if (!firstname || !phonenumber || !email || !password || !name || !plate || !capacity || !vehicleType) {
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
            name,
            plate,
            capacity,
            vehicleType
        }
    });

    return captain;
};
