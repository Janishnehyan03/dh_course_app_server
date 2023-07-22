const router = require("express").Router();
const multer = require("multer");
const { protect, restrictTo } = require("../controllers/authController");
const fs = require("fs");

const Category = require("../models/CategoryModel");

router.post("/", protect, restrictTo("admin"), async (req, res, next) => {
  try {
    const { name } = req.body;
    const image = req.file ? req.file.filename : null;

    const category = await Category.create({ name, image });
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
});

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

    let category = await Category.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );

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
