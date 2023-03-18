const Course = require("../models/CourseModel");

exports.createCourse = async (req, res, next) => {
  try {
    const course = new Course({
      title: req.body.title,
      description: req.body.description,
      thumbnail: req.file.filename, // multer saves the filename in the 'file' object
      videoUrl: req.body.videoUrl,
      learners: [],
      price: req.body.price,
      category: req.body.category,
      creator: req.body.creator,
    });

    const newCourse = await course.save();

    res.status(201).json(newCourse);
  } catch (err) {
    next(err);
  }
};
exports.getAllCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ deleted: false })
      .populate("category", "name")
      .populate("creator", "name");
    res.json({ results: courses.length, courses });
  } catch (err) {
    next(err);
  }
};
exports.getOneCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("category", "name")
      .populate("creator", "name")
      .populate("learners", "name");
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
  } catch (err) {
    next(err);
  }
};

exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { deleted: true },
      { new: true }
    );
    if (!course) {
      return res.status(404).json({ message: "course not found" });
    }
    res.json({ message: "course deleted" });
  } catch (err) {
    next(err);
  }
};
