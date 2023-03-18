const router = require("express").Router();
const multer = require("multer");
const { protect, restrictTo } = require("../controllers/authController");

const Category = require("../models/CategoryModel");
// Set up multer storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folderName = './uploads/categories';
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName);
    }
    cb(null, folderName);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Set up multer file filter
const fileFilter = (req, file, cb) => {
  // Allow only JPEG and PNG files
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG and PNG files are allowed"), false);
  }
};

// Set up multer upload object
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // Limit file size to 5 MB
  },
  fileFilter: fileFilter,
});

router.post(
  "/",
  protect,
  restrictTo("admin"),
  upload.single("image"),
  async (req, res, next) => {
    try {
      const { name } = req.body;
      const image = req.file ? req.file.path : null;

      const category = await Category.create({ name, image });
      res.status(201).json(category);
    } catch (err) {
      next(err);
    }
  }
);

router.get("/", async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    next(err);
  }
});
router.get("/:id", async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const { name } = req.body;
    const image = req.file ? req.file.path : null;

    let category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    category.name = name;
    category.image = image || category.image; // If no new image was uploaded, keep the old image
    await category.save();

    res.json(category);
  } catch (err) {
    next(err);
  }
});
router.delete("/:id", async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json({ message: "Category deleted" });
  } catch (err) {
    next(err);
  }
});
module.exports = router;
