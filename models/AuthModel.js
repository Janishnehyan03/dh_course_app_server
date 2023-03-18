const mongoose = require("mongoose");

const authSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    maxLength: [255, "Email cannot be more than 255 characters"],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please provide a valid email address",
    ],
  },
  name: {
    type: String,
    required: [true, "Name is required"],
    minLength: [2, "Name must be at least 2 characters long"],
    maxLength: [50, "Name cannot be more than 50 characters"],
  },
  googleId: {
    type: String,
    required: [true, "Google ID is required"],
    unique: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
});

const AuthModel = mongoose.model("Auth", authSchema);
module.exports = AuthModel;
