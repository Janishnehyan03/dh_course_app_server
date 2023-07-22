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
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
