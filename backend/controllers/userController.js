const User = require("../models/User");
const { ApiError } = require("../middleware/errorHandler");
const asyncHandler = require("../utils/asyncHandler");

/**
 * @route GET /api/doctors
 * @access Private (any logged-in staff — receptionist needs this list
 *         to assign a doctor when creating an appointment)
 */
const getDoctors = asyncHandler(async (req, res) => {
  const doctors = await User.find({ role: "DOCTOR", isActive: true }).sort({ name: 1 });
  res.status(200).json({ success: true, message: "Doctors fetched", data: doctors });
});

/**
 * @route GET /api/doctors/:id
 * @access Private
 */
const getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await User.findOne({ _id: req.params.id, role: "DOCTOR" });
  if (!doctor) throw new ApiError(404, "Doctor not found");
  res.status(200).json({ success: true, message: "Doctor fetched", data: doctor });
});

/**
 * @route GET /api/receptionists
 * @access Private/Admin
 */
const getReceptionists = asyncHandler(async (req, res) => {
  const receptionists = await User.find({ role: "RECEPTIONIST" }).sort({ name: 1 });
  res.status(200).json({ success: true, message: "Receptionists fetched", data: receptionists });
});

/**
 * @route GET /api/users
 * @access Private/Admin
 * Returns every staff account, for the Admin "Users" page.
 */
const getUsers = asyncHandler(async (req, res) => {
  const { role } = req.query;
  const filter = role ? { role: role.toUpperCase() } : {};
  const users = await User.find(filter).sort({ createdAt: -1 });
  res.status(200).json({ success: true, message: "Users fetched", data: users });
});

/**
 * @route PUT /api/users/:id
 * @access Private/Admin
 * Lets an Admin update a staff member's basic details, or
 * activate/deactivate their account.
 */
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");

  const allowedFields = ["name", "phone", "specialization", "isActive"];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) user[field] = req.body[field];
  });

  // Password changes go through a dedicated flow, not this generic update,
  // to avoid accidentally re-hashing or skipping validation.
  if (req.body.password) {
    user.password = req.body.password;
  }

  await user.save();
  res.status(200).json({ success: true, message: "User updated successfully", data: user });
});

/**
 * Shared helper for creating a staff account with a fixed role.
 * Used by both createDoctor and createReceptionist so validation
 * and duplicate-email handling stay in one place.
 */
const createStaffWithRole = async (body, role) => {
  const { name, email, password, phone, specialization } = body;
  if (!name || !email || !password) {
    throw new ApiError(400, "Name, email and password are required");
  }
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, "A user with this email already exists");
  }
  return User.create({ name, email, password, phone, specialization, role });
};

/**
 * @route POST /api/doctors
 * @access Private/Admin
 */
const createDoctor = asyncHandler(async (req, res) => {
  const doctor = await createStaffWithRole(req.body, "DOCTOR");
  res.status(201).json({ success: true, message: "Doctor created successfully", data: doctor });
});

/**
 * @route POST /api/receptionists
 * @access Private/Admin
 */
const createReceptionist = asyncHandler(async (req, res) => {
  const receptionist = await createStaffWithRole(req.body, "RECEPTIONIST");
  res.status(201).json({ success: true, message: "Receptionist created successfully", data: receptionist });
});

module.exports = {
  getDoctors,
  getDoctorById,
  getReceptionists,
  getUsers,
  updateUser,
  createDoctor,
  createReceptionist,
};
