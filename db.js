const mongoose = require('mongoose');
mongoose.set('bufferCommands', false);

// Define the MongoDB connection URL
const mongoURL = process.env.MONGODB_URL_LOCAL || process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/vote';

// Set up MongoDB connection
mongoose.connect(mongoURL, {
    serverSelectionTimeoutMS: 5000
}).catch((err) => {
    console.error('Initial MongoDB connection failed:', err.message);
});

// Get the default connection
// Mongoose maintains a default connection object representing the MongoDB connection.
const db = mongoose.connection;

// Define event listeners for database connection

db.on('connected', () => {
    console.log('Connected to MongoDB server');
});

db.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

db.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

// Export the database connection
module.exports = db;