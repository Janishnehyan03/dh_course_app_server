const AuthModel = require("../models/AuthModel");
const jwt = require("jsonwebtoken");

exports.singUp = async (req, res, next) => {
  try {
    // Check if the user exists in the database
    const existingUser = await AuthModel.findOne({
      googleId: req.body.googleId,
    });
    if (existingUser) {
      // User already exists
      return res.status(409).json({ message: "User already exists" });
    }

    // Create a new user with the user details from the Google login
    const newUser = new AuthModel({
      name: req.body.name,
      email: req.body.email,
      googleId: req.body.googleId,
    });

    // Save the new user to the database
    await newUser.save();

    // Generate a JWT token for the user
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "100d",
    });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.cookie("jwt", token, {
      httpOnly: true,
      maxAge: decoded.exp,
    });

    // Return the JWT token and the user details
    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    // Check if the user exists in the database
    const existingUser = await AuthModel.findOne({
      googleId: req.body.googleId,
    });
    if (!existingUser) {
      // User doesn't exist
      return res.status(401).json({ message: "Authentication failed" });
    }

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
  } catch (err) {
    next(err);
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
