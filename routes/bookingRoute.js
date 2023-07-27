const { protect } = require("../controllers/authController");
const Booking = require("../models/BookingModel");
const Course = require("../models/CourseModel");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const router = require("express").Router();
const instance = new Razorpay({
  key_id: "rzp_test_PXZvFNXpJFylGx",
  key_secret: process.env.RAZOR_PAY_SECRET,
});

router.post("/:id", protect, async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);

    const options = {
      amount: parseInt(course.price * 100), // amount in the smallest currency unit
      currency: "INR",
      receipt: "order_rcptid_11",
    };

    instance.orders.create(options, async function (err, order) {
      if (!err) {
        await Booking.create({
          course: req.params.id,
          user: req.user._id,
          razorpay_order_id: order.id,
          price: course.price,
        });
        res.status(200).json({
          status: "success",
          order,
        });
      } else {
        console.error(err);
      }
    });
  } catch (error) {
    next(error);
  }
});
router.post("/success/booking", protect, async (req, res, next) => {
  console.log(req.body);
  try {
    const course = await Booking.findOneAndUpdate(
      { razorpay_order_id: req.body.razorpay_order_id },
      {
        course: req.body.course,
        user: req.user._id,
        razorpay_payment_id: req.body.razorpay_payment_id,
        razorpay_order_id: req.body.razorpay_order_id,
        razorpay_signature: req.body.razorpay_signature,
        price: req.body.price,
      }
    );
    try {
      await verifyPayment(
        req.body.razorpay_payment_id,
        req.body.razorpay_order_id,
        req.body.razorpay_signature,
        req.body.course,
        req.user._id
      );
      res.status(200).json({
        status: "success",
        course,
      });
    } catch (error) {
      console.log(error);
      res.status(400).send("Payment verification failed");
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});
function verifyPayment(paymentId, orderId, signature, courseId, userId) {
  return new Promise(async (resolve, reject) => {
    const hmac = crypto.createHmac("sha256", process.env.RAZOR_PAY_SECRET);
    hmac.update(orderId + "|" + paymentId);
    const calculatedSignature = hmac.digest("hex");
    if (calculatedSignature === signature) {
      await Booking.findOneAndUpdate(
        { razorpay_order_id: orderId },
        { paid: true },
        { new: true }
      );
      await Course.findByIdAndUpdate(
        courseId,
        { $addToSet: { learners: userId } },
        { new: true }
      );
      resolve();
    } else {
      reject();
    }
  });
}
module.exports = router;
