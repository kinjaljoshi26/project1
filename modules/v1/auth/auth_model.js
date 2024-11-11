// modules/v1/auth/auth.js
const bcrypt = require('bcrypt');
const db = require('../../../config/db');
const { sendEmail, validateApiKey } = require('../../../config/common'); // Adjust the path if necessary
const crypto = require('crypto'); // Import crypto for generating tokens

// const generateToken = () => {
//   return crypto.randomBytes(16).toString('hex'); // Generates a random 32-character token
// };
//for Get institute 
const getinstitute = (req, res) => {
  db.query('SELECT id,institute_name FROM tbl_institute_type where is_deleted=0', (error, results) => {
    // console.log(this.sql)
    if (error) {
      return res.status(500).json({ message: 'Database query error.' });
    } else {
      res.status(200).json({
        message: 'Success',
        data: [{ results }]
      });
    }
  });
};
//for Get borad ,college and competivie exam details 
const getborads_details = (req, res) => {
  var request = req.body
  db.query('SELECT id,institute_type_id,name,description FROM tbl_borads where institute_type_id=' + request.type_id + '', (error, results) => {
    // console.log(error)
    if (error) {
      return res.status(500).json({ message: 'Database query error.' });
    } else {
      res.status(200).json({
        message: 'Success',
        data: [{ results }]
      });
    }
  });
};
//for getting medium langauge
const getmediumdetails = (req, res) => {
  var request = req.body
  db.query('SELECT id,borad_id,name FROM tbl_medium where borad_id=' + request.borad_id + '', (error, results) => {
    if (error) {
      return res.status(500).json({ message: 'Database query error.' });
    } else {
      res.status(200).json({
        message: 'Success',
        data: [{ results }]
      });
    }
  });
};
//get board category details
const getcategoryetails = (req, res) => {
  var request = req.body
  db.query('SELECT id,medium_id,name FROM tbl_class_category where medium_id=' + request.medium_id + '', (error, results) => {
    if (error) {
      return res.status(500).json({ message: 'Database query error.' });
    } else {
      res.status(200).json({
        message: 'Success',
        data: [{ results }]
      });
    }
  });
};
//get std and subject detials
const getstddetails = (req, res) => {
  const request = req.body;
  db.query('SELECT id , std FROM tbl_std WHERE class_category_id = ?', [request.class_category_id], (error, standards) => {
    if (error) {
      return res.status(500).json({ message: 'Database query error.' });
    }
    async.map(standards, (standard, callback) => {
      db.query('SELECT id ,name FROM tbl_subject WHERE std_id = ?', [standard.id], (error, subjects) => {
        if (error) {
          return callback(error);
        }
        const standardWithSubjects = {
          standard,
          subjects: subjects
        };
        callback(null, standardWithSubjects);
      });
    }, (error, standardsWithSubjects) => {
      if (error) {
        return res.status(500).json({ message: 'Error fetching subjects for standards.' });
      }

      res.status(200).json({
        message: 'Success',
        data: standardsWithSubjects
      });
    });
  });
};
const async = require('async'); // Make sure to include the async module if not already imported
//signup user
const signup = (req, res) => {
  const request = req.body;

  db.query('INSERT INTO tbl_signup (institute_type_id, borads_id, medium_id) VALUES (?, ?, ?)',
    [request.institute_type_id, request.borads_id, request.medium_id],
    (error, results) => {

      if (error) {
        return res.status(500).json({ message: 'Database insert error.', data: null });
      }
      else {

        async.map(request.subject, (subject, callback) => {
          console.log('Inserting subject:',subject);

          db.query('INSERT INTO tbl_signup_subject (user_id, sub_id) VALUES (?, ?)',
            [results.insertId, subject.subject_id],
            (suberr, subres) => {
              if (suberr) {
                return callback(suberr);
              }
              callback(null, subres); 
            });
        }, (suberr, subres) => {
          if (suberr) {
            return res.status(500).json({ message: 'Error inserting subjects.', data: null });
          }

          res.status(200).json({
            message: 'Signup successful and subjects inserted successfully.',
            data: { user_id: results.insertId }  
          });
        });
      }

    });
};



module.exports = {
  getinstitute,
  getborads_details,
  getmediumdetails,
  getcategoryetails,
  getstddetails,
  signup
};
