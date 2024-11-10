// app.js
const express = require('express');
const path = require('path');
const connectDB = require('./config/db'); // Import the database connection
const authRoutes = require('./modules/v1/auth/route'); // Import the routes directly
const { sendEmail,validateApiKey } = require('./config/common'); // Import the validateApiKey middleware

require('dotenv').config(); // Load environment variables
const app = express();
// Middleware to parse JSON bodies
app.use(express.json());
app.use(validateApiKey); // Apply validateApiKey globally to all routes

// Serve the signup HTML file
  app.get('/signup', (req, res) => {
    const filePath = path.join(__dirname, 'modules', 'v1', 'view', 'signup.html');
    res.sendFile(filePath);
  
  });
  app.get('/otp', (req, res) => {
    const filePath = path.join(__dirname, 'modules', 'v1', 'view', 'verify_otp.html');
    res.sendFile(filePath);
  
  });
  app.get('/admin_login', (req, res) => {
    const filePath = path.join(__dirname, 'modules', 'v1', 'view', 'admin_login.html');
    res.sendFile(filePath);
  
  });
  app.get('/customer_login', (req, res) => {
    const filePath = path.join(__dirname, 'modules', 'v1', 'view', 'customer_login.html');
    res.sendFile(filePath);
  
  });
  app.get('/welcome', (req, res) => {
    const filePath = path.join(__dirname, 'modules', 'v1', 'view', 'welcome.html');
    res.sendFile(filePath);
  
  });
// Use the auth routes for API calls
app.use('/api/v1/auth', authRoutes); 

const PORT = process.env.PORT || 2709;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
