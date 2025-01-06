// const userModel = require('../models/user.model');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const blackListTokenModel = require('../models/blackListToken.model');
// const captainModel = require('../models/captain.model');


// module.exports.authUser = async (req, res, next) => {
//     const token = req.cookies.token || req.headers.authorization?.split(' ')[ 1 ];

//     if (!token) {
//         return res.status(401).json({ message: 'Unauthorized' });
//     }


//     const isBlacklisted = await blackListTokenModel.findOne({ token: token });

//     if (isBlacklisted) {
//         return res.status(401).json({ message: 'Unauthorized' });
//     }

//     try {

//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         const user = await userModel.findById(decoded._id)

//         req.user = user;

//         return next();

//     } catch (err) {
//         return res.status(401).json({ message: 'Unauthorized' });
//     }
// }

// module.exports.authCaptain = async (req, res, next) => {
//     const token = req.cookies.token || req.headers.authorization?.split(' ')[ 1 ];


//     if (!token) {
//         return res.status(401).json({ message: 'Unauthorized' });
//     }

//     const isBlacklisted = await blackListTokenModel.findOne({ token: token });



//     if (isBlacklisted) {
//         return res.status(401).json({ message: 'Unauthorized' });
//     }

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         const captain = await captainModel.findById(decoded._id)
//         req.captain = captain;

//         return next()
//     } catch (err) {
//         console.log(err);

//         res.status(401).json({ message: 'Unauthorized' });
//     }
// }



const userModel = require('../models/user.model');
const captainModel = require('../models/captain.model');
const blackListTokenModel = require('../models/blackListToken.model');
const jwt = require('jsonwebtoken');

// Utility function to authenticate token and check blacklist
const authenticateToken = async (token) => {
    if (!token) {
        throw new Error('Unauthorized: No token provided');
    }

    const isBlacklisted = await blackListTokenModel.findOne({ token });
    if (isBlacklisted) {
        throw new Error('Unauthorized: Token is blacklisted');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
};

// Middleware for authenticating users
module.exports.authUser = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        const decoded = await authenticateToken(token);

        const user = await userModel.findById(decoded._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        req.user = user; // Attach user object to the request
        next();
    } catch (error) {
        console.error('User Authentication Error:', error.message);
        res.status(401).json({ message: error.message });
    }
};

// Middleware for authenticating captains
module.exports.authCaptain = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        const decoded = await authenticateToken(token);

        const captain = await captainModel.findById(decoded._id);
        if (!captain) {
            return res.status(404).json({ message: 'Captain not found' });
        }

        req.captain = captain; // Attach captain object to the request
        next();
    } catch (error) {
        console.error('Captain Authentication Error:', error.message);
        res.status(401).json({ message: error.message });
    }
};
