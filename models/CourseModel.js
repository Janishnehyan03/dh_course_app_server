const mongoose = require("mongoose");

// Video Schema
const VideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String, required: true },
  description: { type: String, required: true },
  notes: [{ fileName: { type: String } }],
});

// Unit Schema
const UnitSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  videos: [VideoSchema],
});

// Paper Schema
const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: mongoose.Types.ObjectId, ref: "Category", required: true },
  image: { type: String },
  units: [UnitSchema],
});

// Create and export the Paper model
const Course = mongoose.model("Course", CourseSchema);

module.exports = Course;
