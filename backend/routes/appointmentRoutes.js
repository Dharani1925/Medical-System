const express = require("express");
const {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment,
} = require("../controllers/appointmentController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/", getAppointments);
router.get("/:id", getAppointmentById);
router.post("/", authorize("RECEPTIONIST", "ADMIN"), createAppointment);
router.put("/:id", authorize("RECEPTIONIST", "ADMIN"), updateAppointment);
router.put("/:id/status", authorize("RECEPTIONIST", "ADMIN", "DOCTOR"), updateAppointmentStatus);
router.delete("/:id", authorize("RECEPTIONIST", "ADMIN"), deleteAppointment);

module.exports = router;
