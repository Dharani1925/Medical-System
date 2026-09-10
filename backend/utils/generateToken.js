const jwt = require("jsonwebtoken");

/**
 * Signs a JWT containing the minimum info needed to identify
 * and authorize a user on every subsequent request.
 */
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
  );
};

module.exports = { generateToken };
