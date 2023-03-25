const AuthModel = require("../models/AuthModel");
const jwt = require("jsonwebtoken");
const Email = require("../utils/Email");

exports.signUp = async (req, res, next) => {
  const currentUrl = `${req.protocol}://${req.hostname}/api/v1/auth/verify-token`;
  try {
    async function generateUniqueOTP() {
      const OTP_LENGTH = 6;
      const chars = "0123456789";
      let otp = "";

      do {
        otp = "";
        for (let i = 0; i < OTP_LENGTH; i++) {
          otp += chars[Math.floor(Math.random() * chars.length)];
        }
      } while (await AuthModel.findOne({ otp }));

      return otp;
    }
    const otp = await generateUniqueOTP();
    const existingUser = await AuthModel.findOne({
      email: req.body.email,
      verified: true,
    });
    if (existingUser) {
      // User already exists
      return res.status(409).json({ message: "User already exists" });
    } else {
      await AuthModel.findOneAndRemove({
        email: req.body.email,
        verified: false,
      });
      // Create a new user with the user details from the Google login
      const newUser = new AuthModel({ ...req.body, otpToken: otp });

      // Save the new user to the database
      await newUser.save();
      let email = await new Email({
        email: newUser.email,
        name: newUser.name,
        res: res,
        subject: "Email from CPET Dhiu",
        title: "Confirmation Email",
        otpToken: otp,
        currentUrl: currentUrl,
      })
        .send("OTP")
        .then((data) => {
          console.log("email sent");
        });

      // Return the JWT token and the user details
      res.status(201).json({
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
        },
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    if (!req.body.email || !req.body.password) {
      res.status(401).json({ message: "Please enter email and password" });
    } else {
      const existingUser = await AuthModel.findOne({
        email: req.body.email,
      }).select("+password")
      if (!existingUser) {
        res.status(401).json({ message: "No User Found In This Email" });
      } else {
        let correctPassword =await existingUser.correctPassword(
          req.body.password,
          existingUser.password
        );
        if (!correctPassword) {
          return res.status(401).json({ message: "Incorrect Password" });
        } else {
          // Generate a JWT token for the user
          const token = jwt.sign(
            { userId: existingUser._id },
            process.env.JWT_SECRET,
            { expiresIn: "100d" }
          );
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          res.cookie("jwt", token, {
            httpOnly: true,
            maxAge: decoded.exp,
          });
          // Return the JWT token and the user details
          res.status(200).json({
            token,
            user: {
              id: existingUser._id,
              name: existingUser.name,
              email: existingUser.email,
              role: existingUser.role,
            },
          });
        }
      }
    }
  } catch (err) {
    next(err);
  }
};

exports.verifyToken = async (req, res, next) => {
  try {
    let user = await AuthModel.findOne({
      otpToken: req.body.otpToken,
      email: req.body.email,
    });
    if (user) {
      if (user.otpTokenExpires < Date.now) {
        res.status(400).json({ message: "OTP expired" });
      } else {
        user.verified = true;
        user.otpToken = undefined;
        user.save();
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
          expiresIn: "100d",
        });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        res.cookie("jwt", token, {
          httpOnly: true,
          maxAge: decoded.exp,
        });
        // Return the JWT token and the user details
        res.status(200).json({
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
          },
        });
      }
    } else {
      res.status(400).json({ message: "something went wrong" });
    }
  } catch (error) {
    next(error);
  }
};

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: "You are not authorized to access this resource" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await AuthModel.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        message: "The user belonging to this token no longer exists.",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

// Middleware to restrict access based on role
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission to perform this action.",
      });
    }
    next();
  };
};
