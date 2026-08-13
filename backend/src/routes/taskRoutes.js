const express = require("express");
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
  togglePin,
  getCategories,
  getAiSummary
} = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getTasks);
router.post("/", createTask);
router.get("/ai-summary", getAiSummary);
router.get("/categories", getCategories);
router.put("/:id", updateTask);
router.patch("/:id/toggle", toggleTaskStatus);
router.patch("/:id/pin", togglePin);
router.delete("/:id", deleteTask);

module.exports = router;
