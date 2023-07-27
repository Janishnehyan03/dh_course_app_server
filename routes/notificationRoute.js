const router = require("express").Router();
const admin = require("firebase-admin");

const serviceAccount = require("../cpet-e-learning-firebase-adminsdk-4ihx1-f9131dd2e3.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const tokens = [];
router.post("/", async (req, res) => {
  try {
    const { title, body, imageUrl } = req.body;
    await admin.messaging().sendMulticast({
      tokens,
      notification: {
        title,
        body,
        imageUrl,
      },
    });
    res.status(200).json({ message: "Successfully sent notifications!" });
  } catch (err) {
    res
      .status(err.status || 500)
      .json({ message: err.message || "Something went wrong!" });
  }
});
router.post("/register", async (req, res) => {
  tokens.push(req.body.token);
  res.status(200).json({ message: "Successfully registered FCM Token!" });
});

module.exports = router;
