const userModel = require('../models/user.model');
const userService = require('../services/user.service');
const { validationResult } = require('express-validator');
const blackListTokenModel = require('../models/blackListToken.model');

module.exports.registerUser = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { fullname, phonenumber, password } = req.body;

    // Check if the phone number already exists
    const isUserAlready = await userModel.findOne({ phonenumber });

    if (isUserAlready) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password before saving
    const hashedPassword = await userModel.hashPassword(password);

    // Create the new user
    const user = await userService.createUser({
        firstname: fullname.firstname,
        lastname: fullname.lastname,
        phonenumber,
        password: hashedPassword
    });

    // Generate the authentication token
    const token = user.generateAuthToken();

    // Return the token and user data
    res.status(201).json({ token, user });
};

module.exports.loginUser = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { phonenumber, password } = req.body;

    // Find the user by phone number
    const user = await userModel.findOne({ phonenumber }).select('+password');

    if (!user) {
        return res.status(401).json({ message: 'Invalid phone number or password' });
    }

    // Check if the password matches
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid phone number or password' });
    }

    // Generate the authentication token
    const token = user.generateAuthToken();

    // Set the token in a cookie
    res.cookie('token', token);

    // Return the token and user data
    res.status(200).json({ token, user });
};

module.exports.getUserProfile = async (req, res, next) => {
    res.status(200).json(req.user);
};

module.exports.logoutUser = async (req, res, next) => {
    res.clearCookie('token');
    const token = req.cookies.token || req.headers.authorization.split(' ')[1];

    await blackListTokenModel.create({ token });

    res.status(200).json({ message: 'Logout Successfully' });
};
