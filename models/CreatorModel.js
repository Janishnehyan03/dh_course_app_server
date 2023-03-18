const mongoose = require("mongoose");

const creatorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      maxLength: [100, "Name cannot exceed 100 characters."],
      minLength: [3, "Name must be at least 3 characters."],
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      match: [
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        "Please provide a valid email address.",
      ],
    },
    image: {
      type: String,
      required: [true, "Image URL is required."],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required."],
      match: [/^\+?\d{10,14}$/, "Please provide a valid phone number."],
    },
  },
  {
    timestamps: true,
  }
);

const Creator = mongoose.model("Creator", creatorSchema);
module.exports = Creator;
