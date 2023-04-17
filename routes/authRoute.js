const express = require("express");
const { signUp, login, verifyToken, logout } = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signUp);
router.post("/login", login);
router.get("/logout", logout);
router.post("/verify-token", verifyToken);

module.exports = router;
