/**
 * Custom error class that lets controllers throw errors with
 * a specific HTTP status code attached.
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

/**
 * Handles requests to routes that don't exist.
 */
const notFound = (req, res, next) => {
  const error = new ApiError(404, `Route not found - ${req.originalUrl}`);
  next(error);
};

/**
 * Central error handler. Every error in the app (thrown in controllers,
 * passed via next(err), or Mongoose validation errors) ends up here so
 * that the API always returns a consistent JSON error shape.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Server error";

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    statusCode = 404;
    message = "Resource not found";
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field
      ? `${field} already exists`
      : "Duplicate field value entered";
  }

  // Invalid / expired JWT
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token, please log in again";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Session expired, please log in again";
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = { ApiError, notFound, errorHandler };
