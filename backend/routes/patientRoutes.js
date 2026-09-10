const express = require("express");
const {
  getPatients,
  searchPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient,
} = require("../controllers/patientController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect); // every patient route requires login

// IMPORTANT: /search must be declared before /:id
router.get("/search", searchPatients);

router.get("/", getPatients);
router.get("/:id", getPatientById);

router.post("/", authorize("RECEPTIONIST", "ADMIN"), createPatient);
router.put("/:id", authorize("RECEPTIONIST", "ADMIN"), updatePatient);
router.delete("/:id", authorize("ADMIN"), deletePatient);

module.exports = router;
