const mongoose = require("mongoose");

const APPOINTMENT_STATUSES = ["WAITING", "IN_CONSULTATION", "COMPLETED", "CANCELLED"];

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: [true, "Patient is required"],
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Doctor is required"],
    },
    // Receptionist who created the appointment (useful for auditing)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    appointmentDate: {
      type: String, // stored as YYYY-MM-DD for simple filtering
      required: [true, "Appointment date is required"],
    },
    appointmentTime: {
      type: String, // e.g. "10:30 AM"
      required: [true, "Appointment time is required"],
    },
    tokenNumber: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: APPOINTMENT_STATUSES,
      default: "WAITING",
    },
    reason: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// Speeds up the reception queue query (today's appointments, by status)
appointmentSchema.index({ appointmentDate: 1, doctorId: 1 });

module.exports = mongoose.model("Appointment", appointmentSchema);
module.exports.APPOINTMENT_STATUSES = APPOINTMENT_STATUSES;
