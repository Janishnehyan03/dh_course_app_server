const router = require("express").Router();
const Creator = require("../models/CreatorModel");
const multer = require("multer");
const fs = require("fs");
const AWS = require("aws-sdk");
const sharp = require("sharp");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderName = "./uploads/creators";
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName);
    }
    cb(null, folderName);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer();

router.post("/", upload.single("image"), async (req, res, next) => {
  console.log(req.body.phone)
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
  const { width, height } = await sharp(buffer).metadata();
  const targetWidth = Math.ceil((300 * width) / 300); // Assuming the original image is 300 PPI
  const targetHeight = Math.ceil((300 * height) / 300); // Assuming the original image is 300 PPI
  
  const compressedImageBuffer = await sharp(buffer)
    .resize(targetWidth, targetHeight, {
      fit: "inside",
      withoutEnlargement: true,
    })
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
    let creators = await Creator.find();
    res.status(200).json(creators);
  } catch (error) {
    next(error);
  }
});
router.get("/:id", async (req, res, next) => {
  try {
    const creator = await Creator.findById(req.params.id);
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
    const creator = await Creator.findByIdAndDelete(req.params.id);
    if (!creator) {
      return res.status(404).json({ message: "creator not found" });
    }
    res.json({ message: "creator deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
