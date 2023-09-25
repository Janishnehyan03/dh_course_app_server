const mongoose = require("mongoose");

const wishlistItemSchema = new mongoose.Schema({
  user: { type: mongoose.Types.ObjectId, ref: "Auth", required: true },
  course: { type: mongoose.Types.ObjectId, ref: "Course", required: true },
});

const WishlistItem = mongoose.model("WishlistItem", wishlistItemSchema);

module.exports = WishlistItem;
