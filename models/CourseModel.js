const mongoose = require("mongoose");

// Video Schema
const VideoSchema = new mongoose.Schema({
  title: { type: String },
  videoUrl: { type: String },
  description: { type: String },
  notes: [{ fileName: { type: String } }],
});

// Unit Schema
const UnitSchema = new mongoose.Schema({
  title: { type: String },
  description: { type: String },
  videos: [VideoSchema],
});

// Paper Schema
const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: mongoose.Types.ObjectId, ref: "Category", required: true },
  image: { type: String },
  description: { type: String, required: true },
  units: [UnitSchema],
  price: { type: Number, required: true },
});

// Create and export the Paper model
const Course = mongoose.model("Course", CourseSchema);

module.exports = Course;
