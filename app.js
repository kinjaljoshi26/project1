// app.js
const express = require('express');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./modules/v1/auth/route'); 
const { sendEmail,validateApiKey } = require('./config/common');
require('dotenv').config(); 
const app = express();
app.use(express.json());
app.use(validateApiKey); 
app.use('/api/v1/auth', authRoutes); 

const PORT = process.env.PORT || 2709;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
