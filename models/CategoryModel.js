const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required.'],
      maxLength: [50, 'Name cannot exceed 50 characters.'],
      minLength: [3, 'Name must be at least 3 characters.'],
      unique:true
    },
    image: {
      type: String,
      required: [true, 'Image is required.'],
    },
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
