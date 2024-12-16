const mongoose = require('mongoose');
const { Schema } = mongoose;

// Tag schema
const tagSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
}, {
  timestamps: true, // This will automatically add `createdAt` and `updatedAt` fields
});

// Create a Tag model
const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;