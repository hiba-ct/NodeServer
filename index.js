require('dotenv').config();
const express = require('express');
const cors = require('cors');
const router = require('./routes/router'); 
require('./connection'); // MongoDB connection

const pfServer = express();

// Middlewares
pfServer.use(cors());
pfServer.use(express.json()); 

// Root route
pfServer.get('/', (req, res) => {
    res.status(200).send('<h1 style="color:red;">Server running successfully</h1>');
});

// Use the router for routes
pfServer.use(router);

// Start server
const PORT = process.env.PORT || 4000;
pfServer.listen(PORT, () => {
    console.log(`Server running successfully at port number ${PORT}`);
});
