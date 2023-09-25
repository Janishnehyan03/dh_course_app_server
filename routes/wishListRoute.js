const router = require("express").Router();
const { protect } = require("../controllers/authController");
const WishlistItem = require("../models/WishlistModel"); // Assuming you have the WishlistItem model defined

// Create an item in the wishlist
router.post("/", protect, async (req, res) => {
  const { course } = req.body;
  const user = req.user.id;

  try {
    const wishlistItem = new WishlistItem({
      course,
      user,
    });

    await wishlistItem.save();

    res.status(201).json({ message: "Item added to wishlist successfully" });
  } catch (error) {
    res.status(500).json({ error: "Could not add item to wishlist" });
  }
});

// Get all items in the wishlist for a specific user
router.get("/", protect, async (req, res) => {
  const user = req.user.id;

  try {
    const wishlist = await WishlistItem.find({ user }).populate("course");
    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({ error: "Could not fetch wishlist items" });
  }
});

// Update an item in the wishlist
router.patch("/:id", protect, async (req, res) => {
  const { course } = req.body;
  const user = req.user.id;

  try {
    const updatedWishlistItem = await WishlistItem.findByIdAndUpdate(
      req.params.id,
      { course, user },
      { new: true }
    );

    res.status(200).json(updatedWishlistItem);
  } catch (error) {
    res.status(500).json({ error: "Could not update wishlist item" });
  }
});

// Delete an item from the wishlist
router.delete("/:id", protect, async (req, res) => {
  const user = req.user.id;

  try {
    await WishlistItem.findOneAndDelete({ _id: req.params.id, user });
    res.status(200).json({ message: "Item removed from wishlist" });
  } catch (error) {
    res.status(500).json({ error: "Could not remove item from wishlist" });
  }
});

module.exports = router;
