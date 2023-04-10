const Course = require("../models/CourseModel");
const {
  getAllItems,
  getItemSlug,
  setDeleteStatus,
} = require("./globalFunctions");

exports.createCourse = async (req, res, next) => {
  console.log("function called");
  try {
    const { videoUrl, videoTitle } = req.body;
    const course = new Course({
      ...req.body,
      thumbnail: req.file.filename,
    });

    const newCourse = await course.save();
    res.status(201).json(newCourse);
  } catch (err) {
    next(err);
  }
};
exports.getAllCourses = async (req, res, next) => {
  try {
    let { sort } = req.query;
    let populateFields = "creator,category";
    const courses = await getAllItems(Course, req.query, populateFields, sort);
    res.json({ results: courses.length, courses });
  } catch (err) {
    next(err);
  }
};
exports.getOneCourse = async (req, res, next) => {
  try {
    const course = await getItemSlug(
      Course,
      req.params.slug,
      "category,creator",
      'videos'
    )
    res.json(course);
  } catch (err) {
    next(err);
  }
};

exports.deleteCourse = async (req, res, next) => {
  try {
    const course = await setDeleteStatus(Course, req.params.id);
    res.json({ message: "course deleted" });
  } catch (err) {
    next(err);
  }
};
exports.addVideo = async (req, res, next) => {
  try {
    const videoObj = req.body.videoObj;
    let course = await Course.findByIdAndUpdate(
      req.params.id,
      {
        $push: { videos: videoObj },
      },
      { new: true }
    );
    res.status(200).json(course);
  } catch (error) {
    next(error);
  }
};
