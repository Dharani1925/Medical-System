const express = require("express");
const { getQueue, updateAppointmentStatus } = require("../controllers/appointmentController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/", getQueue);
router.put("/:id/status", authorize("RECEPTIONIST", "ADMIN", "DOCTOR"), updateAppointmentStatus);

module.exports = router;
