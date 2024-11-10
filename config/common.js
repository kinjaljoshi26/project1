// config/common.js
const nodemailer = require('nodemailer');

// Set up Nodemailer transporter for Sendinblue SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com', 
  port: 587, 
  secure: false,
  auth: {
    user: '7cf0bf001@smtp-brevo.com', 
    pass: process.env.SENDINBLUE_API_KEY, 
  },
})
 

// Function to send an email
const sendEmail = async (to, subject, text) => {
  try {
    const mailOptions = {
      from: '7cf0bf001@smtp-brevo.com', 
      to, 
      subject,
      text, 
    };

    // Attempt to send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};


// Middleware for API key validation
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['api-key']; // Assuming the API key is passed in the headers
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(403).json({ message: 'Forbidden: Invalid API key.' });
  }
  next();
};

module.exports = {
  sendEmail,
  validateApiKey,
  
};
