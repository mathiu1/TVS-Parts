const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Part = require('../models/Part');
const User = require('../models/User');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tvs-parts';

const images = [
  'https://images.unsplash.com/photo-1541888062-817ab3de5f9b?auto=format&fit=crop&w=400&q=80', // Boom pump / Crane
  'https://images.unsplash.com/photo-1621503882772-f67fecdfb3ce?auto=format&fit=crop&w=400&q=80', // Self loading mixer / Mixer truck
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80', // Stationary pump / construction
  'https://images.unsplash.com/photo-1581699042598-be31461f3693?auto=format&fit=crop&w=400&q=80'  // Transit mixer
];

const seedParts = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Get an admin user to assign as the uploader
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('No admin user found. Please register an admin first.');
      process.exit(1);
    }

    // Let's create exactly 150 entries
    const partsToSeeed = [];
    const usedNumbers = new Set();
    
    // Some starting seed part number to guarantee uniqueness
    let baseNumber = 10024987;

    for (let i = 0; i < 150; i++) {
        let partNumber = (baseNumber + i).toString();
        
        let imageUrl = images[Math.floor(Math.random() * images.length)];

        partsToSeeed.push({
            partNumber,
            imageUrl: imageUrl,
            cloudinaryPublicId: `seeded-schwing-${partNumber}`,
            uploadedBy: admin._id
        });
    }

    const result = await Part.insertMany(partsToSeeed, { ordered: false });
    console.log(`Successfully seeded ${result.length} Schwing Stetter parts!`);
    
    process.exit(0);
  } catch (error) {
    if (error.code === 11000) {
      console.error('Some seeds failed due to duplicate part numbers, but surviving items were added.');
    } else {
      console.error('Error seeding data:', error);
    }
    process.exit(1);
  }
};

seedParts();
