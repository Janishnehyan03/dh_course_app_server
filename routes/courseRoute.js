const multer = require("multer");
const {
  createCourse,
  getAllCourses,
  getOneCourse,
} = require("../controllers/courseController");
const router = require("express").Router();
const fs=require('fs')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderName = "./uploads/courses";
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

router.post("/", upload.single("thumbnail"), createCourse);
router.get("/", getAllCourses);
router.get("/:id", getOneCourse);

module.exports = router;
