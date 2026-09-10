const Patient = require("../models/Patient");
const { ApiError } = require("../middleware/errorHandler");
const asyncHandler = require("../utils/asyncHandler");

/**
 * @route GET /api/patients
 * @access Private (Receptionist, Doctor, Admin)
 */
const getPatients = asyncHandler(async (req, res) => {
  const patients = await Patient.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, message: "Patients fetched", data: patients });
});

/**
 * @route GET /api/patients/search?query=
 * @access Private (Receptionist, Doctor, Admin)
 * Searches by name, phone or patientId. Declared before /:id in routes
 * so "search" isn't mistaken for an ObjectId.
 */
const searchPatients = asyncHandler(async (req, res) => {
  const { query } = req.query;
  if (!query || !query.trim()) {
    throw new ApiError(400, "A search query is required");
  }

  const regex = new RegExp(query.trim(), "i");
  const patients = await Patient.find({
    $or: [{ name: regex }, { phone: regex }, { patientId: regex }],
  }).sort({ createdAt: -1 });

  res.status(200).json({ success: true, message: "Search results", data: patients });
});

/**
 * @route GET /api/patients/:id
 * @access Private (Receptionist, Doctor, Admin)
 */
const getPatientById = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) throw new ApiError(404, "Patient not found");
  res.status(200).json({ success: true, message: "Patient fetched", data: patient });
});

/**
 * @route POST /api/patients
 * @access Private (Receptionist, Admin)
 */
const createPatient = asyncHandler(async (req, res) => {
  const { name, age, gender, phone, email, address, emergencyContact } = req.body;

  if (!name || age === undefined || !gender || !phone) {
    throw new ApiError(400, "Name, age, gender and phone are required");
  }

  const patient = await Patient.create({
    name,
    age,
    gender,
    phone,
    email,
    address,
    emergencyContact,
  });

  res.status(201).json({ success: true, message: "Patient registered successfully", data: patient });
});

/**
 * @route PUT /api/patients/:id
 * @access Private (Receptionist, Admin)
 */
const updatePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) throw new ApiError(404, "Patient not found");

  const allowedFields = ["name", "age", "gender", "phone", "email", "address", "emergencyContact"];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) patient[field] = req.body[field];
  });

  await patient.save();
  res.status(200).json({ success: true, message: "Patient updated successfully", data: patient });
});

/**
 * @route DELETE /api/patients/:id
 * @access Private (Admin only)
 */
const deletePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) throw new ApiError(404, "Patient not found");

  await patient.deleteOne();
  res.status(200).json({ success: true, message: "Patient deleted successfully", data: {} });
});

module.exports = {
  getPatients,
  searchPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
};
