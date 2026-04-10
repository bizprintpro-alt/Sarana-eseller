const mongoose = require('mongoose');

const connectDB = async (retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
      if (!uri) {
        console.error('MONGODB_URI not set');
        return;
      }
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
      console.log(`MongoDB connected: ${conn.connection.host}`);
      return;
    } catch (err) {
      console.error(`MongoDB connection attempt ${i + 1}/${retries} failed:`, err.message);
      if (i < retries - 1) {
        console.log(`Retrying in ${(i + 1) * 3} seconds...`);
        await new Promise(r => setTimeout(r, (i + 1) * 3000));
      }
    }
  }
  console.error('MongoDB connection failed after all retries. Server will start without DB.');
};

module.exports = connectDB;
