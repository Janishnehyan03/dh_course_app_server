const mongoose = require("mongoose");
const crypto=require('crypto')
const bcrypt=require('bcryptjs')

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
  password: {
    type: String,
    required: [true, "Password is required"],
    select:false
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  otpToken:{
    type:String
  },
  otpTokenExpires:{
    type:Date
  },
  verified:{
    type:Boolean,
    default:false
  }
});

authSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
// bcrypt compare
authSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
const AuthModel = mongoose.model("Auth", authSchema);
module.exports = AuthModel;
