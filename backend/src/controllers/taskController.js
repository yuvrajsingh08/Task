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

  if (Object.prototype.hasOwnProperty.call(body, "pinned")) {
    payload.pinned = Boolean(body.pinned);
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

const parseQueryDate = (value) => {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

const getSortSpec = (sortBy = "newest") => {
  switch (sortBy) {
    case "oldest":
      return { pinned: -1, createdAt: 1 };
    case "title":
      return { pinned: -1, title: 1 };
    case "dueDate":
      return { pinned: -1, dueDate: 1 };
    case "priority":
      return { pinned: -1, priorityRank: -1, createdAt: -1 };
    case "newest":
    default:
      return { pinned: -1, createdAt: -1 };
  }
};

const priorityRankStage = {
  $addFields: {
    priorityRank: {
      $switch: {
        branches: [
          { case: { $eq: ["$priority", "High"] }, then: 3 },
          { case: { $eq: ["$priority", "Medium"] }, then: 2 },
        ],
        default: 1,
      },
    },
  },
};

const getTasks = async (req, res) => {
  try {
    const {
      search,
      status,
      priority,
      category,
      tag,
      dueFrom,
      dueTo,
      excludeCompleted,
      pinned,
      sortBy,
    } = req.query;
    const query = { user: req.user._id };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    if (excludeCompleted === "true") {
      query.status = { $ne: "Completed" };
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

    if (pinned === "true") {
      query.pinned = true;
    }

    const dueFromDate = parseQueryDate(dueFrom);
    const dueToDate = parseQueryDate(dueTo);

    if (dueFromDate || dueToDate) {
      query.dueDate = { $ne: null };

      if (dueFromDate) {
        query.dueDate.$gte = dueFromDate;
      }

      if (dueToDate) {
        query.dueDate.$lte = dueToDate;
      }
    }

    const page = req.query.page ? parseInt(req.query.page, 10) : null;
    const pageSizeParam = req.query.pageSize
      ? parseInt(req.query.pageSize, 10)
      : null;
    const sortSpec = getSortSpec(sortBy);
    const usePrioritySort = sortBy === "priority";

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
      const skip = (currentPage - 1) * pageSize;

      const tasks = usePrioritySort
        ? await Task.aggregate([
            { $match: query },
            priorityRankStage,
            { $sort: sortSpec },
            { $skip: skip },
            { $limit: pageSize },
          ])
        : await Task.find(query).sort(sortSpec).skip(skip).limit(pageSize);

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

    const tasks = usePrioritySort
      ? await Task.aggregate([
          { $match: query },
          priorityRankStage,
          { $sort: sortSpec },
        ])
      : await Task.find(query).sort(sortSpec);

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

const togglePin = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.pinned = !task.pinned;
    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({
      message: "Failed to update pin",
      error: error.message,
    });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Task.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: { $ifNull: ["$category", "General"] },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1, _id: 1 } },
    ]);

    res.json(
      categories.map((item) => ({
        name: item._id || "General",
        count: item.count,
      })),
    );
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch categories",
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
  togglePin,
  getCategories,
  getAiSummary,
};