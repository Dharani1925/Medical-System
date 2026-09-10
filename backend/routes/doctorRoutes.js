const express = require("express");
const { getDoctors, getDoctorById, createDoctor } = require("../controllers/userController");
const { protect, authorize } = require("../middleware/auth");
const { updateUser } = require("../controllers/userController");

const router = express.Router();

router.use(protect);

router.get("/", getDoctors); // any logged-in staff can see the doctor list
router.get("/:id", getDoctorById);
router.post("/", authorize("ADMIN"), createDoctor);
router.put("/:id", authorize("ADMIN"), updateUser);

module.exports = router;
