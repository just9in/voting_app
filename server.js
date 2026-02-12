const express = require('express')
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();
const app = express();
const db = require('./db');

const bodyParser = require('body-parser'); 
app.use(bodyParser.json()); // req.body
app.use(express.static(path.join(__dirname, 'public')));
const PORT = process.env.PORT || 3000;

// Import the router files
const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');

const requireDatabaseConnection = (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            error: 'Database unavailable. Start MongoDB or update MONGODB_URL_LOCAL/MONGODB_URL in .env'
        });
    }
    next();
};

// Use the routers
app.use('/user', requireDatabaseConnection, userRoutes);
app.use('/candidate', requireDatabaseConnection, candidateRoutes);


app.listen(PORT, ()=>{
    console.log('listening on port 3000');
})