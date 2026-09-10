const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      unique: true,
      // generated in pre-save hook below, e.g. PT-000123
    },
    name: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
    },
    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [0, "Age cannot be negative"],
      max: [130, "Age seems invalid"],
    },
    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
      required: [true, "Gender is required"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^[0-9+\-\s]{7,15}$/, "Please provide a valid phone number"],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
      // optional, but validated if provided
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    emergencyContact: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// Auto-generate a human-readable patient ID like PT-000001
patientSchema.pre("save", async function (next) {
  if (this.patientId) return next();
  const Patient = mongoose.model("Patient");
  const count = await Patient.countDocuments();
  this.patientId = `PT-${String(count + 1).padStart(6, "0")}`;
  next();
});

// Text index to support name/phone/patientId search
patientSchema.index({ name: "text", phone: "text", patientId: "text" });

module.exports = mongoose.model("Patient", patientSchema);
