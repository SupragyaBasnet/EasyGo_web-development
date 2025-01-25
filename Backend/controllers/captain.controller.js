const captainModel = require('../models/captain.model');
const captainService = require('../services/captain.service');
const blackListTokenModel = require('../models/blackListToken.model');
const { validationResult } = require('express-validator');


module.exports.registerCaptain = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { fullname, phonenumber,email, password, vehicle } = req.body;

    // Check if captain already exists
    const isCaptainAlreadyExist = await captainModel.findOne({
        $or: [{ phonenumber }, { email }]
    }).select('+password');

    if (isCaptainAlreadyExist) {
        return res.status(400).json({ message: 'Captain already exists' });
    }

    // Hash the password
    const hashedPassword = await captainModel.hashPassword(password);

    // Create the captain
    const captain = await captainService.createCaptain({
        firstname: fullname.firstname,
        lastname: fullname.lastname,
        phonenumber,
        email,
        password: hashedPassword,
        color: vehicle.color,
        plate: vehicle.plate,
        capacity: vehicle.capacity,
        vehicleType: vehicle.vehicleType
    });

    // Generate token
    const token = captain.generateAuthToken();

    res.status(201).json({ token, captain });
};
module.exports.loginCaptain = async (req, res, next) => {
    const { phonenumber, password } = req.body;

    console.log("Login request received for:", { phonenumber, password });

    try {
        const captain = await captainModel.findOne({ phonenumber }).select('+password');

        if (!captain) {
            console.log("Captain not found for phone number:", phonenumber);
            return res.status(401).json({ message: 'Invalid phone number or password' });
        }

        const isMatch = await captain.comparePassword(password);

        if (!isMatch) {
            console.log("Password mismatch for captain:", phonenumber);
            return res.status(401).json({ message: 'Invalid phone number or password' });
        }

        const token = captain.generateAuthToken();
        console.log("Login successful for captain:", phonenumber);

        res.cookie('token', token);
        return res.status(200).json({ token, captain });
    } catch (error) {
        console.error("Error during login:", error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
};




module.exports.getCaptainProfile = async (req, res, next) => {
    res.status(200).json({ captain: req.captain });
};

module.exports.logoutCaptain = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(400).json({ message: 'No token provided' });
    }

    // Blacklist the token
    await blackListTokenModel.create({ token });

    // Clear cookie
    res.clearCookie('token');

    res.status(200).json({ message: 'Logout successfully' });
};
