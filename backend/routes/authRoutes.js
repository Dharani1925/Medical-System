const express = require("express");
const { register, login, getMe } = require("../controllers/authController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.post("/login", login);

// Only an Admin can create new staff accounts (Doctor/Receptionist/Admin).
// There is no public self-registration in a clinic staff system.
router.post("/register", protect, authorize("ADMIN"), register);

router.get("/me", protect, getMe);

module.exports = router;
