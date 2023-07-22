const Course = require("../models/CourseModel");
const { getAllItems, setDeleteStatus } = require("./globalFunctions");
const AWS = require("aws-sdk");
const sharp = require("sharp");

const uploadImage = async (req) => {
  try {
    const spacesEndpoint = new AWS.Endpoint("blr1.digitaloceanspaces.com"); // Use the correct endpoint for your region
    const s3 = new AWS.S3({
      endpoint: spacesEndpoint,
      accessKeyId: process.env.SPACES_KEY,
      secretAccessKey: process.env.SPACES_SECRET,
    });
    const { originalname, buffer } = req.file;

    const compressedImageBuffer = await sharp(buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 80 })
      .toBuffer();
    // Set the bucket name and file path
    const bucketName = "cpet-storage";
    const filePath = `courses/${req.body.title}.jpeg`;

    // Set the upload parameters
    const uploadParams = {
      Bucket: bucketName,
      Key: filePath,
      Body: compressedImageBuffer,
      ACL: "public-read", // Set the desired ACL for the uploaded file
    };
    const uploadResult = await s3.upload(uploadParams).promise();
    const thumbnailURL = uploadResult.Location;
    return thumbnailURL;
  } catch (error) {}
};

exports.createCourse = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image provided" });
  }
  uploadImage(req);

  try {
    // Upload the file to DigitalOcean Spaces
    let imageUrl = await uploadImage(req);
    const course = new Course({
      ...req.body,
      thumbnail: imageUrl,
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

exports.editCourse = async (req, res, next) => {
  try {
    const courseSlug = req.params.slug; // Assuming you have the course ID in the request parameters
    const course = await Course.findOne({ slug: courseSlug });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    // Check if an image file is provided
    if (req.file) {
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

      // Upload the file to DigitalOcean Spaces
      const uploadResult = await s3.upload(uploadParams).promise();
      const thumbnailURL = uploadResult.Location;

      // Update the course with the new thumbnail URL
      course.thumbnail = thumbnailURL;
    }

    // Update other course fields based on the req.body
    course.title = req.body.title;
    course.description = req.body.description;
    // Update other fields as needed

    const updatedCourse = await course.save();
    res.json(updatedCourse);
  } catch (err) {
    next(err);
  }
};

exports.updateCourseThumbnail = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image provided" });
    }

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

    // Upload the file to DigitalOcean Spaces
    const uploadResult = await s3.upload(uploadParams).promise();
    const thumbnailURL = uploadResult.Location;

    // Update the course with the new thumbnail URL
    const courseSlug = req.params.slug; // Assuming you have the course slug in the request parameters
    const course = await Course.findOneAndUpdate(
      { slug: courseSlug },
      { thumbnail: thumbnailURL },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json(course);
  } catch (err) {
    next(err);
  }
};
