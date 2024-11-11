// modules/v1/auth/route.js
const express = require('express');
const authController = require('./auth_model'); // Import the authentication logic
const router = express.Router();
router.post('/getinsititue', authController.getinstitute);
router.post('/getboards', authController.getborads_details);
router.post('/getmediumdetails', authController.getmediumdetails);
router.post('/getcategoryetails', authController.getcategoryetails);
router.post('/getstddetails', authController.getstddetails);
router.post('/signup', authController.signup);

module.exports = router;
