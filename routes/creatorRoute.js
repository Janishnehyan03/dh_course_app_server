const router = require("express").Router();
const Creator = require("../models/CreatorModel");
const multer=require('multer')
const fs=require('fs')

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

const upload = multer({ storage });

router.post("/", upload.single("image"), async (req, res, next) => {
  try {
    let creator = await Creator.create({
      ...req.body,
      image: req.file.filename,
    });
    res.status(201).json(creator)
  } catch (error) {
    next(error);
  }
});
router.get("/",async (req, res, next) => {
  try {
    let creators = await Creator.find();
    res.status(200).json(creators)
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
