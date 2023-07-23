const mongoose = require("mongoose");
const slugify = require("slugify");

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
    slug: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
creatorSchema.pre("save", function (next) {
  //pre middleware have a (next) key
  //works before .save() & .create() , not work in .insert() and not for findByIdAnd...
  this.slug = slugify(this.name, { lower: true });
  next();
});
const Creator = mongoose.model("Creator", creatorSchema);
module.exports = Creator;
