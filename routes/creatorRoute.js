const router = require("express").Router();
const Creator = require("../models/CreatorModel");
const multer = require("multer");
const fs = require("fs");
const AWS = require("aws-sdk");
const sharp = require("sharp");

const upload = multer();

router.post("/", upload.single("image"), async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image provided" });
  }
  const spacesEndpoint = new AWS.Endpoint("blr1.digitaloceanspaces.com"); // Use the correct endpoint for your region
  const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
    accessKeyId: process.env.SPACES_KEY,
    secretAccessKey: process.env.SPACES_SECRET,
  });

  const compressedImageBuffer = await sharp(buffer)
    .resize(700, 700)
    .toFormat("jpeg")
    .jpeg({ quality: 80 })
    .toBuffer();
  // Set the bucket name and file path
  const bucketName = "cpet-storage";
  const filePath = `creators/${
    req.body.name + Math.floor(Date.now() / 1000)
  }.jpeg`;

  // Set the upload parameters
  const uploadParams = {
    Bucket: bucketName,
    Key: filePath,
    Body: compressedImageBuffer,
    ACL: "public-read", // Set the desired ACL for the uploaded file
  };
  try {
    const uploadResult = await s3.upload(uploadParams).promise();
    const thumbnailURL = uploadResult.Location;

    let creator = await Creator.create({
      ...req.body,
      image: thumbnailURL,
    });
    res.status(201).json(creator);
  } catch (error) {
    next(error);
  }
});
router.get("/", async (req, res, next) => {
  try {
    let creators = await Creator.find({ deleted: { $ne: true } });
    res.status(200).json(creators);
  } catch (error) {
    next(error);
  }
});
router.get("/:id", async (req, res, next) => {
  try {
    const creator = await Creator.findById(req.params.id, {
      deleted: { $ne: true },
    });
    if (!creator) {
      return res.status(404).json({ message: "creator not found" });
    }
    res.json(creator);
  } catch (err) {
    next(err);
  }
});
router.patch("/:id", async (req, res, next) => {
  try {
    const { name } = req.body;
    const image = req.file ? req.file.path : null;

    let creator = await Creator.findById(req.params.id);
    if (!creator) {
      return res.status(404).json({ message: "creator not found" });
    }

    creator.name = name;
    creator.image = image || creator.image; // If no new image was uploaded, keep the old image
    await creator.save();

    res.json(creator);
  } catch (err) {
    next(err);
  }
});
router.delete("/:id", async (req, res, next) => {
  try {
    const creator = await Creator.findByIdAndUpdate(
      req.params.id,
      { deleted: true },
      { new: true }
    );
    if (!creator) {
      return res.status(404).json({ message: "creator not found" });
    }
    res.json({ message: "creator deleted" });
  } catch (err) {
    next(err);
  }
});


exports.updateCreatorThumbnail = async (req, res, next) => {
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
    const filePath = `creators/${originalname}`;

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
    const course = await Creator.findByIdAndUpdate(
      req.params.id,
      { image: thumbnailURL },
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
module.exports = router;
