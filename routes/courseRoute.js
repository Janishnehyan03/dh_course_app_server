const multer = require("multer");
const {
  createCourse,
  getAllCourses,
  getOneCourse,
  deleteCourse,
  addVideo,
  editCourse,
  updateCourseThumbnail,
} = require("../controllers/courseController");
const router = require("express").Router();
const { protect, restrictTo } = require("../controllers/authController");

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const folderName = "./uploads/courses";
//     if (!fs.existsSync(folderName)) {
//       fs.mkdirSync(folderName);
//     }
//     cb(null, folderName);
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });

const upload = multer();

router.post(
  "/",
  protect,
  restrictTo("admin"),
  upload.single("thumbnail"),
  createCourse
);
router.post("/:id", protect, restrictTo("admin"), addVideo);
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
