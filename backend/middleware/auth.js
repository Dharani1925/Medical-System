const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { ApiError } = require("./errorHandler");
const asyncHandler = require("../utils/asyncHandler");

/**
 * Verifies the JWT sent in the Authorization header (Bearer token),
 * loads the corresponding user, and attaches it to req.user.
 * Any route that needs a logged-in user should use this first.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    throw new ApiError(401, "Not authorized, no token provided");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET); // throws if invalid/expired
  // JsonWebTokenError / TokenExpiredError are caught by asyncHandler -> errorHandler

  const user = await User.findById(decoded.userId);
  if (!user) {
    throw new ApiError(401, "Not authorized, user no longer exists");
  }
  if (!user.isActive) {
    throw new ApiError(403, "This account has been deactivated");
  }

  req.user = user; // available to every downstream controller
  next();
});

/**
 * Restricts a route to specific roles. Use AFTER `protect`.
 * Usage: router.post("/", protect, authorize("ADMIN"), controllerFn)
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Not authorized, no user on request");
    }
    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(
        403,
        `Role '${req.user.role}' is not permitted to access this resource`
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
