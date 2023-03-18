const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Error Controller
const errorController = (err, req, res, next) => {
  // Set Default Error Status and Message
  let status = err.statusCode || 500;
  let message = err.message;

  // Handle Mongoose Validation Errors
  if (err instanceof mongoose.Error.ValidationError) {
    status = 422;
    const errors = {};
    for (const field in err.errors) {
      errors[field] = err.errors[field].message;
    }
    message = 'Validation error occurred';
  }

  // Handle JWT Errors
  if (err instanceof jwt.JsonWebTokenError) {
    status = 401;
    message = 'Invalid token';
  }

  // Handle JWT Expired Token Errors
  if (err instanceof jwt.TokenExpiredError) {
    status = 401;
    message = 'Expired token';
  }
 // Handle Mongoose Duplicate Key Error
if (err.code === 11000) {
    status = 409;
    const fieldName = Object.keys(err.keyValue)[0];
    message = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is already in use`;
  }
  
  // Log Error to Console
  console.error(err);

  // Send JSON Response
  if (process.env.NODE_ENV === 'production') {
    console.log(process.env.NODE_ENV);
    res.status(status).json({
      status: 'error',
      message: message
    });
  } else {
    res.status(status).json({
      status: 'error',
      message: message,
      stack: err.stack
    });
  }
};

module.exports = errorController;
