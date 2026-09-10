const User = require("../models/User");
const { generateToken } = require("../utils/generateToken");
const { ApiError } = require("../middleware/errorHandler");
const asyncHandler = require("../utils/asyncHandler");

/**
 * @route   POST /api/auth/register
 * @access  Private/Admin
 * Only an already-logged-in Admin can create new Doctor/Receptionist/Admin
 * accounts. This keeps the system closed — there's no public sign-up,
 * which is correct for an internal clinic staff system.
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, specialization } = req.body;

  if (!name || !email || !password || !role) {
    throw new ApiError(400, "Name, email, password and role are required");
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ApiError(409, "A user with this email already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    phone,
    specialization,
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: user, // password stripped automatically by toJSON transform
  });
});

/**
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  // password has `select: false` in the schema, so we explicitly request it here
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }
  if (!user.isActive) {
    throw new ApiError(403, "This account has been deactivated");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = generateToken(user);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        specialization: user.specialization,
      },
    },
  });
});

/**
 * @route   GET /api/auth/me
 * @access  Private
 * Lets the frontend restore the logged-in session on page refresh
 * by re-fetching the current user using the stored token.
 */
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Current user fetched",
    data: req.user,
  });
});

module.exports = { register, login, getMe };
