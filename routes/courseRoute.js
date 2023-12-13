const multer = require("multer");
const {
  createCourse,
  getAllCourses,
  getOneCourse,
  deleteCourse,
  addVideo,
  editCourse,
  updateCourseThumbnail,
  addNote,
} = require("../controllers/courseController");
const router = require("express").Router();
const { protect, restrictTo } = require("../controllers/authController");
const storage = multer.diskStorage({
  destination: "/tmp",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

router.post(
  "/",
  protect,
  restrictTo("admin"),
  createCourse
);
router.post("/:id", protect, restrictTo("admin"), addVideo);
router.patch(
  "/notes/:id",
  protect,
  restrictTo("admin"),
  upload.single("file"),
  addNote
);
router.get("/", getAllCourses);
router.get("/:slug", getOneCourse);
router.delete("/:id", protect, restrictTo("admin"), deleteCourse);
router.patch("/:slug", protect, restrictTo("admin"), editCourse);
router.patch(
  "/:slug/thumbnail",
  protect,
  restrictTo("admin"),
  upload.single("thumbnail"),
  updateCourseThumbnail
);

module.exports = router;
