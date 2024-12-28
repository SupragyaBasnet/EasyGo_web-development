const express = require('express');
const router = express.Router();
const { body } = require("express-validator");
const userController = require('../controllers/user.controller');

// Register route with phone number validation
router.post('/register', [
  body('phonenumber')
      .matches(/^\d{10}$/)  // Match exactly 10 digits
      .withMessage('Phone number must be exactly 10 digits'),
  body('fullname.firstname')
      .isLength({ min: 3 })
      .withMessage('First name must be at least 3 characters long'),
  body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
],
    userController.registerUser
);

// Login route with phone number validation
// router.post('/login', [
//     body('phoneNumber').matches(/^\d{10}$/).withMessage('Phone number must be exactly 10 digits'),
//     body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
// ],
//     userController.loginUser
// );

module.exports = router;
