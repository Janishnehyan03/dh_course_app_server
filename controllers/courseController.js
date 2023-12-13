const Course = require("../models/CourseModel");
const { getAllItems, setDeleteStatus } = require("./globalFunctions");
const AWS = require("aws-sdk");
const sharp = require("sharp");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "mern-chat",
  api_key: "429624652472589",
  api_secret: "itnPWv02w8Cpl67YxTH2qh3mO-w",
});

exports.createCourse = async (req, res, next) => {
  try {
    const course = new Course(req.body);
    const newCourse = await course.save();
    res.status(201).json(newCourse);
  } catch (err) {
    next(err);
  }
};

exports.getAllCourses = async (req, res, next) => {
  try {
    let { sort } = req.query;
    let populateFields = "category";
    const courses = await getAllItems(Course, req.query, populateFields, sort);
    res.json({ results: courses.length, courses });
  } catch (err) {
    next(err);
  }
};
exports.getOneCourse = async (req, res, next) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug })
      .populate("creators")
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

exports.addNote = async (req, res) => {
  try {
    const { videoId } = req.body;

    // Find the video by its ID

    const cloudinaryResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "notes",
      width: 2400,
      height: 1600,
      crop: "limit",
    });

    const updatedVideo = await Course.findOneAndUpdate(
      { "units.videos._id": videoId },
      {
        $push: {
          "units.$.videos.$[video].notes": {
            fileName: cloudinaryResult.secure_url,
            // No text field in this case
          },
        },
      },
      {
        arrayFilters: [{ "video._id": videoId }],
        new: true,
      }
    );

    return res.json({ message: "Note uploaded successfully", updatedVideo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
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
