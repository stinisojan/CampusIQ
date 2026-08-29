const mongoose = require('mongoose');
const config = require('./env');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    console.warn(`[MongoDB] Note: Ensure MongoDB is running locally at ${config.MONGODB_URI} or set MONGODB_URI to a valid MongoDB Atlas connection string in .env`);
    // If running in development, we won't crash immediately so memory store and APIs can still report health
    if (config.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
