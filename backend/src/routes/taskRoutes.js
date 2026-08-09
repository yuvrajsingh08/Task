const express = require("express");
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
  getAiSummary
} = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getTasks);
router.post("/", createTask);
router.get("/ai-summary", getAiSummary);
router.put("/:id", updateTask);
router.patch("/:id/toggle", toggleTaskStatus);
router.delete("/:id", deleteTask);

module.exports = router;
