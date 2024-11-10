// config/db.js
var mysql = require('mysql');
require('dotenv').config(); // Ensure your .env file is loaded

var configuration = {
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
};
console.log(configuration)
var pool = mysql.createPool(configuration);

// Function to test the connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to MySQL:', err.message);
        return;
    }
    console.log('Connected to MySQL database.');

    // Release the connection back to the pool
    connection.release();
});

module.exports = pool; // Export the connection pool
