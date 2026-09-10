const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const User = require("../models/User");
const { ApiError } = require("../middleware/errorHandler");
const asyncHandler = require("../utils/asyncHandler");

const POPULATE_PATIENT = { path: "patientId", select: "name patientId age gender phone" };
const POPULATE_DOCTOR = { path: "doctorId", select: "name specialization" };

/**
 * @route GET /api/appointments
 * @access Private
 * Supports ?date=YYYY-MM-DD, ?doctorId=..., ?status=...
 * A Doctor calling this without filters only sees their own appointments,
 * so a doctor can never browse another doctor's schedule by omission.
 */
const getAppointments = asyncHandler(async (req, res) => {
  const { date, doctorId, status } = req.query;
  const filter = {};

  if (date) filter.appointmentDate = date;
  if (status) filter.status = status;

  if (req.user.role === "DOCTOR") {
    filter.doctorId = req.user._id; // doctors are always scoped to themselves
  } else if (doctorId) {
    filter.doctorId = doctorId;
  }

  const appointments = await Appointment.find(filter)
    .populate(POPULATE_PATIENT)
    .populate(POPULATE_DOCTOR)
    .sort({ tokenNumber: 1 });

  res.status(200).json({ success: true, message: "Appointments fetched", data: appointments });
});

/**
 * @route GET /api/appointments/:id
 * @access Private
 */
const getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate(POPULATE_PATIENT)
    .populate(POPULATE_DOCTOR);
  if (!appointment) throw new ApiError(404, "Appointment not found");
  res.status(200).json({ success: true, message: "Appointment fetched", data: appointment });
});

/**
 * @route POST /api/appointments
 * @access Private (Receptionist, Admin)
 * Auto-generates the next token number for that doctor on that date.
 */
const createAppointment = asyncHandler(async (req, res) => {
  const { patientId, doctorId, appointmentDate, appointmentTime, reason } = req.body;

  if (!patientId || !doctorId || !appointmentDate || !appointmentTime) {
    throw new ApiError(400, "Patient, doctor, date and time are required");
  }

  const [patient, doctor] = await Promise.all([
    Patient.findById(patientId),
    User.findOne({ _id: doctorId, role: "DOCTOR" }),
  ]);
  if (!patient) throw new ApiError(404, "Patient not found");
  if (!doctor) throw new ApiError(404, "Doctor not found");

  const lastToken = await Appointment.findOne({ doctorId, appointmentDate })
    .sort({ tokenNumber: -1 })
    .select("tokenNumber");
  const tokenNumber = lastToken ? lastToken.tokenNumber + 1 : 1;

  const appointment = await Appointment.create({
    patientId,
    doctorId,
    createdBy: req.user._id,
    appointmentDate,
    appointmentTime,
    reason,
    tokenNumber,
    status: "WAITING",
  });

  const populated = await appointment.populate([POPULATE_PATIENT, POPULATE_DOCTOR]);

  res.status(201).json({
    success: true,
    message: `Appointment created — token #${tokenNumber}`,
    data: populated,
  });
});

/**
 * @route PUT /api/appointments/:id
 * @access Private (Receptionist, Admin)
 * General edits (reschedule, change reason, change doctor). Status changes
 * for the queue go through updateAppointmentStatus below, which has extra rules.
 */
const updateAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) throw new ApiError(404, "Appointment not found");

  const allowedFields = ["doctorId", "appointmentDate", "appointmentTime", "reason"];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) appointment[field] = req.body[field];
  });

  await appointment.save();
  res.status(200).json({ success: true, message: "Appointment updated", data: appointment });
});

/**
 * @route PUT /api/appointments/:id/status  (also exposed as PUT /api/queue/:id/status)
 * @access Private (Receptionist updates most transitions; Doctor can start/complete their own)
 * This is the endpoint that actually drives the reception queue.
 */
const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["WAITING", "IN_CONSULTATION", "COMPLETED", "CANCELLED"];
  if (!status || !validStatuses.includes(status)) {
    throw new ApiError(400, `Status must be one of: ${validStatuses.join(", ")}`);
  }

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) throw new ApiError(404, "Appointment not found");

  // A doctor may only change the status of their OWN appointments
  if (req.user.role === "DOCTOR" && String(appointment.doctorId) !== String(req.user._id)) {
    throw new ApiError(403, "You can only update your own appointments");
  }

  appointment.status = status;
  await appointment.save();

  res.status(200).json({ success: true, message: `Appointment marked as ${status}`, data: appointment });
});

/**
 * @route DELETE /api/appointments/:id
 * @access Private (Receptionist, Admin)
 */
const deleteAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) throw new ApiError(404, "Appointment not found");
  await appointment.deleteOne();
  res.status(200).json({ success: true, message: "Appointment deleted", data: {} });
});

/**
 * @route GET /api/queue?date=YYYY-MM-DD
 * @access Private
 * The reception queue view: today's appointments across all doctors
 * (or just the logged-in doctor's, if role is DOCTOR), ordered by token.
 */
const getQueue = asyncHandler(async (req, res) => {
  const date = req.query.date || new Date().toISOString().slice(0, 10);
  const filter = { appointmentDate: date, status: { $in: ["WAITING", "IN_CONSULTATION"] } };

  if (req.user.role === "DOCTOR") {
    filter.doctorId = req.user._id;
  }

  const queue = await Appointment.find(filter)
    .populate(POPULATE_PATIENT)
    .populate(POPULATE_DOCTOR)
    .sort({ tokenNumber: 1 });

  res.status(200).json({ success: true, message: "Queue fetched", data: queue });
});

module.exports = {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment,
  getQueue,
};
