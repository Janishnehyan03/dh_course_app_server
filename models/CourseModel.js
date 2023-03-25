const mongoose = require("mongoose");
const slugify = require("slugify");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required."],
      unique: true,
      maxLength: [100, "Title cannot exceed 100 characters."],
      minLength: [3, "Title must be at least 3 characters."],
    },
    slug: String, //this slug makes the name property lowercase and put --- sign between words
    description: {
      type: String,
      required: [true, "Description is required."],
      maxLength: [1000, "Description cannot exceed 1000 characters."],
      minLength: [10, "Description must be at least 10 characters."],
    },
    thumbnail: {
      type: String,
      required: [true, "Thumbnail URL is required."],
    },
    previewVideo: {
      type: String,
      required: [true, "Video URL is required."],
    },
    learners: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Auth",
      },
    ],
    price: {
      type: Number,
      required: [true, "Price is required."],
      min: [0, "Price cannot be negative."],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required."],
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Creator",
      required: [true, "Creator is required."],
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    videos: [
      {
        videoUrl: {
          type: String,
          select: false,
        },
        videoTitle: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);
courseSchema.pre("save", function (next) {
  //pre middleware have a (next) key
  //works before .save() & .create() , not work in .insert() and not for findByIdAnd...
  this.slug = slugify(this.title, { lower: true });
  next();
});

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
