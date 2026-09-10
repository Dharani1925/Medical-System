const express = require("express");
const {
  getReceptionists,
  createReceptionist,
  updateUser,
} = require("../controllers/userController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect, authorize("ADMIN"));

router.get("/", getReceptionists);
router.post("/", createReceptionist);
router.put("/:id", updateUser);

module.exports = router;
