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
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    cloudinaryPublicId: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'tvs-parts-list-user',
      required: true,
    },
  },
  { timestamps: true }
);

// Text index for fast search
partSchema.index({ partNumber: 'text' });

module.exports = mongoose.model('Part', partSchema);
