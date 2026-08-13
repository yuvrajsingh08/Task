const Task = require("../models/Task");
const { normalizeCategory, isFutureDateTime } = require("../utils/validation");

const buildTaskPayload = (body) => {
  const payload = { ...body };

  if (Object.prototype.hasOwnProperty.call(body, "dueDate")) {
    payload.dueDate = body.dueDate || null;
  }

  if (Object.prototype.hasOwnProperty.call(body, "reminderAt")) {
    payload.reminderAt = body.reminderAt || null;
    payload.reminderEmailSentAt = null;
    payload.reminderEmailStatus = "pending";
    payload.reminderLastError = "";
  }

  if (Object.prototype.hasOwnProperty.call(body, "reminderEmailEnabled")) {
    payload.reminderEmailEnabled = Boolean(body.reminderEmailEnabled);
  }

  if (payload.reminderEmailEnabled === true) {
    payload.reminderEmailSentAt = null;
    payload.reminderEmailStatus = "pending";
    payload.reminderLastError = "";
  }

  if (Object.prototype.hasOwnProperty.call(body, "category")) {
    payload.category = normalizeCategory(body.category);
  }

  if (Object.prototype.hasOwnProperty.call(body, "tags")) {
    payload.tags = Array.isArray(body.tags)
      ? body.tags
          .map((tag) => String(tag).trim())
          .filter(Boolean)
      : [];
  }

  return payload;
};

const validateTaskDates = (payload) => {
  if (payload.dueDate && !isFutureDateTime(payload.dueDate)) {
    throw new Error("Due date must be in the future");
  }

  if (payload.reminderAt && !isFutureDateTime(payload.reminderAt)) {
    throw new Error("Reminder time must be in the future");
  }
};

const getTasks = async (req, res) => {
  try {
    const { search, status, priority, category, tag } = req.query;
    const query = { user: req.user._id };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    if (status && status !== "All") {
      query.status = status;
    }

    if (priority && priority !== "All") {
      query.priority = priority;
    }

    if (category && category !== "All") {
      query.category = normalizeCategory(category);
    }

    if (tag && tag !== "All") {
      query.tags = tag.trim();
    }

    const page = req.query.page ? parseInt(req.query.page, 10) : null;
    const pageSizeParam = req.query.pageSize
      ? parseInt(req.query.pageSize, 10)
      : null;

    if (page) {
      const DEFAULT_PAGE_SIZE = 10;
      const MAX_PAGE_SIZE = 100;

      const pageSize =
        Number.isFinite(pageSizeParam) && pageSizeParam > 0
          ? Math.min(pageSizeParam, MAX_PAGE_SIZE)
          : DEFAULT_PAGE_SIZE;

      const currentPage = Math.max(1, page);

      const total = await Task.countDocuments(query);
      const totalPages = Math.max(1, Math.ceil(total / pageSize));

      const tasks = await Task.find(query)
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * pageSize)
        .limit(pageSize);

      return res.json({
        tasks,
        meta: {
          total,
          page: currentPage,
          pageSize,
          totalPages,
        },
      });
    }

    const tasks = await Task.find(query).sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch tasks",
      error: error.message,
    });
  }
};

const createTask = async (req, res) => {
  try {
    const payload = buildTaskPayload(req.body);
    validateTaskDates(payload);

    const task = await Task.create({
      ...payload,
      user: req.user._id,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({
      message: "Failed to create task",
      error: error.message,
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const payload = buildTaskPayload(req.body);
    validateTaskDates(payload);

    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user._id,
      },
      payload,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json(task);
  } catch (error) {
    res.status(400).json({
      message: "Failed to update task",
      error: error.message,
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete task",
      error: error.message,
    });
  }
};

const toggleTaskStatus = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const statusFlow = ["Todo", "In Progress", "Pending", "Completed"];
    const currentIndex = statusFlow.indexOf(task.status);

    task.status =
      statusFlow[(currentIndex + 1) % statusFlow.length];

    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update task status",
      error: error.message,
    });
  }
};

const getAiSummary = async (req, res) => {
  try {
    const tasks = await Task.find({
      user: req.user._id,
    });

   const total = tasks.length;

  const completed = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const todo = tasks.filter(
    (task) => task.status === "Todo"
  ).length;

  const inProgress = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  const pending = tasks.filter(
    (task) => task.status === "Pending"
  ).length;

  const unfinished = todo + inProgress + pending;

    const highPriorityUnfinished = tasks.filter(
      (task) =>
        task.status !== "Completed" &&
        task.priority === "High",
    ).length;

    const suggestions = [];

    if (unfinished === 0 && total > 0) {
      suggestions.push("Great work. All tasks are completed.");
    }

    if (highPriorityUnfinished > 0) {
      suggestions.push(
        `Start with ${highPriorityUnfinished} high priority task(s).`,
      );
    }

    const overdueTasks = tasks.filter((task) => {
      return (
        task.status !== "Completed" &&
        task.dueDate &&
        new Date(task.dueDate) < new Date()
      );
    });

    if (overdueTasks.length > 0) {
      suggestions.push(
        `Review ${overdueTasks.length} overdue task(s) before adding new work.`,
      );
    }

    if (unfinished > 5) {
      suggestions.push(
        "Break unfinished work into smaller categories to keep the board easier to scan.",
      );
    }

    if (suggestions.length === 0) {
      suggestions.push(
        "Your task list looks balanced. Keep progressing through your tasks.",
      );
    }

    res.json({
      summary: `You have ${total} task(s): ${completed} completed, ${inProgress} in progress, and ${todo} to-do.`,
      suggestions,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate summary",
      error: error.message,
    });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
  getAiSummary,
};