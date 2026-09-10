const mongoose = require("mongoose");

const consultationSchema = new mongoose.Schema(
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
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: [true, "Appointment is required"],
    },
    symptoms: {
      type: String,
      required: [true, "Symptoms are required"],
      trim: true,
    },
    diagnosis: {
      type: String,
      required: [true, "Diagnosis is required"],
      trim: true,
    },
    prescription: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// This is the index that makes "medical history" queries fast:
// find every consultation for a patient, across every doctor, in order.
consultationSchema.index({ patientId: 1, createdAt: -1 });
consultationSchema.index({ doctorId: 1, createdAt: -1 });

module.exports = mongoose.model("Consultation", consultationSchema);
