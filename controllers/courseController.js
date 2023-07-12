const Course = require("../models/CourseModel");
const { getAllItems, setDeleteStatus } = require("./globalFunctions");
const AWS = require("aws-sdk");
const sharp=require('sharp')

exports.createCourse = async (req, res, next) => {
  const spacesEndpoint = new AWS.Endpoint("blr1.digitaloceanspaces.com"); // Use the correct endpoint for your region
  const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: process.env.SPACES_KEY,
    secretAccessKey: process.env.SPACES_SECRET,
  });
  const { originalname, buffer } = req.file;

  const compressedImageBuffer = await sharp(buffer)
    .resize({ fit: "inside", withoutEnlargement: true })
    .toFormat("jpeg")
    .jpeg({ quality: 80 })
    .toBuffer();
  // Set the bucket name and file path
  const bucketName = "cpet-storage";
  const filePath = `courses/${originalname}`;

  // Set the upload parameters
  const uploadParams = {
    Bucket: bucketName,
    Key: filePath,
    Body: compressedImageBuffer,
    ACL: "public-read", // Set the desired ACL for the uploaded file
  };

  try {
    // Upload the file to DigitalOcean Spaces
    const uploadResult = await s3.upload(uploadParams).promise();
    const thumbnailURL = uploadResult.Location;

    const course = new Course({
      ...req.body,
      thumbnail: thumbnailURL,
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
    const course = await Course.findOne({ slug: req.params.slug })
      .populate("creator")
      .populate("category")
      .select(
        "videos title description price thumbnail previewVideo learners "
      );

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
