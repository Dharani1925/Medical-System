const express = require("express");
const {
  createConsultation,
  getConsultationsByPatient,
  getConsultationsByDoctor,
  getConsultationById,
  updateConsultation,
} = require("../controllers/consultationController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/patient/:patientId", getConsultationsByPatient); // full medical history
router.get("/doctor/:doctorId", getConsultationsByDoctor);
router.get("/:id", getConsultationById);
router.post("/", authorize("DOCTOR"), createConsultation);
router.put("/:id", authorize("DOCTOR"), updateConsultation);

module.exports = router;
