const mongoose = require("mongoose");

const creatorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      maxLength: [100, "Name cannot exceed 100 characters."],
      minLength: [3, "Name must be at least 3 characters."],
    },
    image: {
      type: String,
      required: [true, "Image URL is required."],
    },

    description: {
      type: String,
    },
    deleted: {
      default: false,
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

const Creator = mongoose.model("Creator", creatorSchema);
module.exports = Creator;
