const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Part = require('../models/Part');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tvs-parts';

const removeSeedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Only removing the 150 test documents that have the seeded Cloudinary string
    const result = await Part.deleteMany({
      cloudinaryPublicId: { $regex: '^seeded-schwing-' }
    });

    console.log(`Successfully removed ${result.deletedCount} test data items.`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error removing test data:', error);
    process.exit(1);
  }
};

removeSeedData();
