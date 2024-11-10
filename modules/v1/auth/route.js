// modules/v1/auth/route.js
const express = require('express');
const authController = require('./auth_model'); // Import the authentication logic
const router = express.Router();

// Signup route
router.post('/signup', authController.signup);
router.post('/otpverify', authController.verifyOTP);
router.post('/login', authController.login);
router.post('/resend_otp', authController.resendOTP);


module.exports = router;
