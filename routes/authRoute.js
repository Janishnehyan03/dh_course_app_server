const express = require("express");
const { singUp, login } = require("../controllers/authController");

const router = express.Router();

router.post("/signup", singUp);
router.post("/login", login);

module.exports = router;
