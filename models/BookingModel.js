const mongoose = require("mongoose");

const bookingSchema = mongoose.Schema({
  course: {
    type: mongoose.Schema.ObjectId,
    ref: "Tour",
    required: [true, "Booking must be related to a tour"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "Booking must be related to a User"],
  },
  price: {
    type: Number,
    required: [true, "Booking must have a price"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: false,
  },

  razorpay_payment_id: {
    type: String,
  },
  razorpay_order_id: {
    type: String,
  },
  razorpay_signature: {
    type: String,
  },
});


const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
