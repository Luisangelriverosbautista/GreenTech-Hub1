require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const routes = require('./src/routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware - CORS configuration
const allowedOrigins = process.env.CORS_ORIGINS 
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
  : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Database connection with SSL support for MongoDB Atlas
const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
};

if (process.env.MONGODB_URI && process.env.MONGODB_URI.includes('mongodb+srv://')) {
    mongooseOptions.tls = true;
}

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/greentech-hub', mongooseOptions)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    if (process.env.NODE_ENV === 'production') {
      console.error('Production: Database connection required');
    }
  });

// Routes
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});