const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Connection pool — reuse connections instead of opening new ones
      maxPoolSize: 10,
      minPoolSize: 2,
      // Server selection timeout (fail fast)
      serverSelectionTimeoutMS: 5000,
      // Socket timeout
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
