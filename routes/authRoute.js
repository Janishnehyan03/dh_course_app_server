const express = require("express");
const { signUp, login, verifyToken, logout, getUser } = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signUp);
router.post("/login", login);
router.post("/logout", logout);
router.post("/verify-token", verifyToken);
router.get("/user", getUser);

module.exports = router;
