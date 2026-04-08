const mongoose = require('mongoose');

const partSchema = new mongoose.Schema(
  {
    partNumber: {
      type: String,
      unique: true,
      required: [true, 'Part number is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    uomDimension: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    cloudinaryPublicId: {
      type: String,
      required: false,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Text index for fast search
partSchema.index({ partNumber: 'text', description: 'text' });

module.exports = mongoose.model('Part', partSchema);
