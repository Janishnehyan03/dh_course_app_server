// Error Controller
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const handleModelValidationError = (err, res) => {
  if (err.name === "ValidationError") {
    // Handling Mongoose Validation Errors
    const errors = {};
    for (const field in err.errors) {
      const errorMessage =
        process.env.NODE_ENV === "production"
          ? `${field} is required`
          : err.errors[field].message;
      errors[field] = errorMessage;
    }
    res
      .status(422)
      .json({ status: "error", message: "Validation error occurred", errors });
    return true;
  }
  return false;
};

const handleDuplicateKeyError = (err, res) => {
  if (err.code === 11000) {
    // Handling Mongoose Duplicate Key Error
    const fieldName = Object.keys(err.keyValue)[0];
    const message = `${
      fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
    } is already in use`;
    res.status(409).json({ status: "error", message });
    return true;
  }
  return false;
};

const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || 500;
  let message = err.message;

  if (
    !handleModelValidationError(err, res) &&
    !handleDuplicateKeyError(err, res)
  ) {
    // Handle other errors if needed
    console.error(err);
    if (process.env.NODE_ENV === "production") {
      res.status(status).json({ status: "error", message });
    } else {
      res.status(status).json({ status: "error", message, stack: err.stack });
    }
  }
};

module.exports = errorHandler;
