const Task = require("../models/Task");

const getTasks = async (req, res) => {
  try {
    const { search, status, priority } = req.query;
    const query = { user: req.user._id };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } }
      ];
    }

    if (status && status !== "All") {
      query.status = status;
    }

    if (priority && priority !== "All") {
      query.priority = priority;
    }

    const tasks = await Task.find(query).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tasks", error: error.message });
  }
};

const createTask = async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, user: req.user._id });
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: "Failed to create task", error: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, req.body, {
      new: true,
      runValidators: true
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    res.status(400).json({ message: "Failed to update task", error: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete task", error: error.message });
  }
};

const toggleTaskStatus = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.status = task.status === "Completed" ? "Pending" : "Completed";
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Failed to update task status", error: error.message });
  }
};

const getAiSummary = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id });
    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === "Completed").length;
    const pending = total - completed;
    const highPriorityPending = tasks.filter(
      (task) => task.status === "Pending" && task.priority === "High"
    ).length;

    const suggestions = [];

    if (pending === 0 && total > 0) {
      suggestions.push("Great work. All tasks are completed.");
    }

    if (highPriorityPending > 0) {
      suggestions.push(`Start with ${highPriorityPending} high priority pending task(s).`);
    }

    const overdueTasks = tasks.filter((task) => {
      return task.status === "Pending" && task.dueDate && new Date(task.dueDate) < new Date();
    });

    if (overdueTasks.length > 0) {
      suggestions.push(`Review ${overdueTasks.length} overdue task(s) before adding new work.`);
    }

    if (pending > 5) {
      suggestions.push("Break pending work into smaller categories to keep the board easier to scan.");
    }

    if (suggestions.length === 0) {
      suggestions.push("Your task list looks balanced. Keep progressing through pending work.");
    }

    res.json({
      summary: `You have ${total} task(s): ${completed} completed and ${pending} pending.`,
      suggestions
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate summary", error: error.message });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
  getAiSummary
};
