// modules/v1/auth/auth.js
const bcrypt = require('bcrypt');
const db = require('../../../config/db');
const { sendEmail, validateApiKey } = require('../../../config/common'); // Adjust the path if necessary
const crypto = require('crypto'); // Import crypto for generating tokens

// Generate a random token
const generateToken = () => {
  return crypto.randomBytes(16).toString('hex'); // Generates a random 32-character token
};

// Signup admin and user 
const signup = (req, res) => {
  const request = req.body;

  // Check if user already exists
  db.query('SELECT * FROM tbl_user WHERE email = ?', [request.email], (error, results) => {
    if (error) {
      return res.status(500).json({ message: 'Database query error.' });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    // Hash the password
    bcrypt.hash(request.password, 10, (error, hashedPassword) => {
      if (error) {
        return res.status(500).json({ message: 'Error hashing password.' });
      }

      const otp = 1234; 
      db.query('INSERT INTO tbl_user (first_name, last_name, email, password, role, otp) VALUES (?, ?, ?, ?, ?, ?)',
        [request.first_name, request.last_name, request.email, hashedPassword, request.role, otp],
        (error, results) => {
          if (error) {
            return res.status(500).json({ message: 'Database insert error.', data: null });
          }
          db.query('INSERT INTO tbl_user_device (user_id, token) VALUES (?, ?)', [results.insertId, ''], (error) => {
            if (error) {
              return res.status(500).json({ message: 'Error inserting token into tbl_user_device.' });
            }
          });
          sendEmail(request.email, 'Verify email', 'Your One-Time Password (OTP) for verification is: ' + otp);

          res.status(200).json({
            message: 'User registered successfully!',
            data: [{ id: results.insertId }] 
          });
        });
    });
  });
};

// Login function
const login = (req, res) => {
  const request = req.body;

  if (!request.email || !request.password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  // Check if user exists
  db.query('SELECT * FROM tbl_user WHERE email = ?', [request.email], (error, results) => {
    if (error) {
      return res.status(500).json({ message: 'Database query error.' });
    }
    
    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    if(request.role!=results[0].role)
{
  return res.status(401).json({ message: 'you`re not allowed to login form here' });

}
    const user = results[0];
    if (user.verify_status === 'unverified') {
      return res.status(200).json({ code:4 ,message: 'Your account is not verified.', data: user.id });
    }
    bcrypt.compare(request.password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ message: 'Error comparing passwords.' });
      }

      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      const newToken = generateToken();

      // Update the token in tbl_user_device
      db.query('UPDATE tbl_user_device SET token = ? WHERE user_id = ?', [newToken, user.id], (error) => {
        if (error) {
          return res.status(500).json({ message: 'Error updating token in tbl_user_device.' });
        }

        return res.status(200).json({code:1,
          message: 'Login successful.',
          data: [{ id: user.id, token: newToken }]
        });
      });
    });
  });
};

// Function to verify OTP
const verifyOTP = (req, res) => {
  const request = req.body;

  if (!request.id || !request.otp) {
    return res.status(400).json({code:0, message: 'User ID and OTP are required.',data:null });
  }

  db.query('SELECT * FROM tbl_user WHERE id = ?', [request.id], (error, result) => {
    if (error) {
      return res.status(500).json({code:0, message: 'Database query error.' ,data:null });
    }

    if (result.length === 0) {
      return res.status(404).json({ code:0,message: 'User not found.',data:null });
    }

    const user = result[0];
    if (user.otp != request.otp) {
      return res.status(400).json({ code:0 ,message: 'Invalid OTP. Please try again.' ,data:null });
    }

    // If OTP is valid, update the user status
    db.query("UPDATE tbl_user SET ? WHERE id = ?", [{ verify_status: 'verified', otp: '' }, request.id], (updateError) => {
      if (updateError) {
        return res.status(500).json(updateError);
      } else {
        res.status(200).json({code:1, message: 'OTP verified successfully!',data:{'role':user.role} });
      }
    });
  });
};
//resend otp
const resendOTP = (req, res) => {
  const request= req.body;

  db.query('SELECT * FROM tbl_user WHERE id = ?', [request.id], (error, results) => {
    if (error) {
      return res.status(500).json({ code:0,message: 'Database query error.',data:null });
    }

    if (results.length === 0) {
      return res.status(400).json({code:0, message: 'User does not exist.',data:null });
    }
    const user = results[0];
    const otp = '1234';

    db.query('UPDATE tbl_user SET otp = ? WHERE id = ?', [otp, user.id], (error) => {
      if (error) {
        return res.status(500).json({code:0, message: 'Error updating OTP in database.',data:null });
      }

      // Send the new OTP via email
      sendEmail(user.email, 'Your OTP', `Your new One-Time Password (OTP) is: ${otp}`)
        .then(() => {
          res.status(200).json({ code:1,message: 'OTP has been resent successfully!',data:user });
        })
        .catch((error) => {
          console.error('Error sending email:', error);
          res.status(500).json({code:0, message: 'Error sending OTP email.' ,data:null });
        });
    });
  });
};

module.exports = {
  verifyOTP,
  signup,
  login,
  resendOTP
};
