require('dotenv').config(); // to load .env
const mongoose = require('mongoose');
// Connect to MongoDB
const db = mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected.'))
  .catch((err) => console.log('MongoDB connection error:', err));
module.exports = db;