const Consultation = require("../models/Consultation");
const Appointment = require("../models/Appointment");
const { ApiError } = require("../middleware/errorHandler");
const asyncHandler = require("../utils/asyncHandler");

const POPULATE_DOCTOR = { path: "doctorId", select: "name specialization" };
const POPULATE_PATIENT = { path: "patientId", select: "name patientId age gender" };

/**
 * @route POST /api/consultations
 * @access Private/Doctor
 * This is the single most important endpoint in the system: it's what
 * turns a doctor's visit into a permanent, shared entry in the patient's
 * medical history — visible to every doctor who treats this patient later.
 */
const createConsultation = asyncHandler(async (req, res) => {
  const { patientId, appointmentId, symptoms, diagnosis, prescription, notes } = req.body;

  if (!patientId || !appointmentId || !symptoms || !diagnosis) {
    throw new ApiError(400, "Patient, appointment, symptoms and diagnosis are required");
  }

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new ApiError(404, "Appointment not found");

  // A doctor can only add a consultation to their OWN appointment
  if (String(appointment.doctorId) !== String(req.user._id)) {
    throw new ApiError(403, "You can only add consultations for your own appointments");
  }
  // Sanity check: the appointment must actually belong to this patient
  if (String(appointment.patientId) !== String(patientId)) {
    throw new ApiError(400, "Appointment does not belong to this patient");
  }

  const consultation = await Consultation.create({
    patientId,
    doctorId: req.user._id,
    appointmentId,
    symptoms,
    diagnosis,
    prescription,
    notes,
  });

  // Consultation saved => the visit is done => close out the appointment.
  appointment.status = "COMPLETED";
  await appointment.save();

  const populated = await consultation.populate(POPULATE_DOCTOR);

  res.status(201).json({
    success: true,
    message: "Consultation saved and added to patient's medical history",
    data: populated,
  });
});

/**
 * @route GET /api/consultations/patient/:patientId
 * @access Private
 * Returns the patient's COMPLETE medical history, across every doctor,
 * newest first. This is what proves "one patient, many doctors, one history".
 */
const getConsultationsByPatient = asyncHandler(async (req, res) => {
  const consultations = await Consultation.find({ patientId: req.params.patientId })
    .populate(POPULATE_DOCTOR)
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: "Medical history fetched",
    data: consultations,
  });
});

/**
 * @route GET /api/consultations/doctor/:doctorId
 * @access Private
 * A doctor's own consultation history (used on the doctor dashboard).
 * A doctor may only view their own list; Admin can view anyone's.
 */
const getConsultationsByDoctor = asyncHandler(async (req, res) => {
  if (req.user.role === "DOCTOR" && String(req.user._id) !== String(req.params.doctorId)) {
    throw new ApiError(403, "You can only view your own consultations");
  }

  const consultations = await Consultation.find({ doctorId: req.params.doctorId })
    .populate(POPULATE_PATIENT)
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, message: "Doctor consultations fetched", data: consultations });
});

/**
 * @route GET /api/consultations/:id
 * @access Private
 */
const getConsultationById = asyncHandler(async (req, res) => {
  const consultation = await Consultation.findById(req.params.id)
    .populate(POPULATE_DOCTOR)
    .populate(POPULATE_PATIENT);
  if (!consultation) throw new ApiError(404, "Consultation not found");
  res.status(200).json({ success: true, message: "Consultation fetched", data: consultation });
});

/**
 * @route PUT /api/consultations/:id
 * @access Private/Doctor
 * A doctor may only edit their OWN consultation notes (e.g. to fix a typo
 * shortly after saving) — never another doctor's clinical record.
 */
const updateConsultation = asyncHandler(async (req, res) => {
  const consultation = await Consultation.findById(req.params.id);
  if (!consultation) throw new ApiError(404, "Consultation not found");

  if (String(consultation.doctorId) !== String(req.user._id)) {
    throw new ApiError(403, "You can only edit your own consultation records");
  }

  const allowedFields = ["symptoms", "diagnosis", "prescription", "notes"];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) consultation[field] = req.body[field];
  });

  await consultation.save();
  res.status(200).json({ success: true, message: "Consultation updated", data: consultation });
});

module.exports = {
  createConsultation,
  getConsultationsByPatient,
  getConsultationsByDoctor,
  getConsultationById,
  updateConsultation,
};
