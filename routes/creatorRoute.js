const router = require("express").Router();
const Creator = require("../models/CreatorModel");
const multer = require("multer");
const fs = require("fs");
const AWS = require("aws-sdk");
const sharp = require("sharp");

const upload = multer();

const uploadImage = async (req) => {
  try {
    const spacesEndpoint = new AWS.Endpoint("blr1.digitaloceanspaces.com"); // Use the correct endpoint for your region
    const s3 = new AWS.S3({
      endpoint: spacesEndpoint,
      accessKeyId: process.env.SPACES_KEY,
      secretAccessKey: process.env.SPACES_SECRET,
    });
    const { buffer } = req.file;

    const compressedImageBuffer = await sharp(buffer)
      .resize(2000, 1333)
      .toFormat("jpeg")
      .jpeg({ quality: 80 })
      .toBuffer();
    // Set the bucket name and file path
    const bucketName = "cpet-storage";
    const filePath = `creator/${req.body.name + "-" + Date.now()}.jpeg`;

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
router.post("/", upload.single("image"), async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image provided" });
  }

  try {
    const imageURL = await uploadImage(req);

    let creator = await Creator.create({
      ...req.body,
      image: imageURL,
      slug: req.body.name,
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
router.get("/:slug", async (req, res, next) => {
  try {
    const creator = await Creator.findOne({
      deleted: { $ne: true },
      slug: req.params.slug,
    });
    if (!creator) {
      return res.status(404).json({ message: "creator not found" });
    }
    res.json(creator);
  } catch (err) {
    next(err);
  }
});
router.patch("/:slug", async (req, res, next) => {
  try {
    let creator = await Creator.findOneAndUpdate(
      { slug: req.params.slug },
      { name: req.body.name, description: req.body.description },
      {
        new: true,
      }
    );
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

router.patch(
  "/thumbnail/:slug",
  upload.single("image"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image provided" });
      }
      let image = await uploadImage(req);
      let creator = await Creator.findOneAndUpdate(
        { slug: req.params.slug },
        { image },
        { new: true }
      );
      res.status(200).json({
        updated: true,
        creator,
      });
    } catch (err) {
      next(err);
    }
  }
);
module.exports = router;
