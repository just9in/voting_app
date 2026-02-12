const express = require('express')
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();
const app = express();
const db = require('./db');

const bodyParser = require('body-parser'); 
app.use(bodyParser.json()); // req.body

const defaultCorsOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500'
];

const corsOriginsFromEnv = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const allowedOrigins = [...new Set([...defaultCorsOrigins, ...corsOriginsFromEnv])];

app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (!origin || allowedOrigins.includes(origin)) {
        if (origin) {
            res.header('Access-Control-Allow-Origin', origin);
        }
        res.header('Vary', 'Origin');
        res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
        res.header('Access-Control-Allow-Credentials', 'true');

        if (req.method === 'OPTIONS') {
            return res.sendStatus(204);
        }

        return next();
    }

    return res.status(403).json({ error: 'Not allowed by CORS' });
});

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