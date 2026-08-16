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

const buildLocalAiSummary = (tasks) => {
  const total = tasks.length;

  const completed = tasks.filter(
    (task) => task.status === "Completed",
  ).length;

  const todo = tasks.filter(
    (task) => task.status === "Todo",
  ).length;

  const inProgress = tasks.filter(
    (task) => task.status === "In Progress",
  ).length;

  const pending = tasks.filter(
    (task) => task.status === "Pending",
  ).length;

  const unfinished = todo + inProgress + pending;

  const highPriorityUnfinished = tasks.filter(
    (task) =>
      task.status !== "Completed" &&
      task.priority === "High",
  ).length;

  const overdueTasks = tasks.filter((task) => {
    return (
      task.status !== "Completed" &&
      task.dueDate &&
      new Date(task.dueDate) < new Date()
    );
  });

  const suggestions = [];

  if (unfinished === 0 && total > 0) {
    suggestions.push("Great work. All tasks are completed.");
  }

  if (highPriorityUnfinished > 0) {
    suggestions.push(
      `Start with ${highPriorityUnfinished} high priority task(s).`,
    );
  }

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

  return {
    summary: `You have ${total} task(s): ${completed} completed, ${inProgress} in progress, and ${todo} to-do.`,
    suggestions,
    source: "local",
  };
};

const parseGeminiJson = (text = "") => {
  if (!text || typeof text !== "string") {
    return null;
  }

  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Continue with JSON extraction below.
  }

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");

  if (start === -1 || end === -1 || start > end) {
    return null;
  }

  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
};

const getGeminiModel = () => {
    return process.env.GEMINI_MODEL || "gemini-3-flash-preview";
};

const requestGeminiJson = async ({
  prompt,
  responseSchema,
  maxOutputTokens = 1024,
}) => {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;

  if (!apiKey) {
    throw new Error("GOOGLE_GENAI_API_KEY is not configured");
  }

  if (typeof fetch !== "function") {
    throw new Error("Fetch is not available in this environment");
  }

  const model = getGeminiModel();

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],

        generationConfig: {
          maxOutputTokens,
          responseMimeType: "application/json",
          responseSchema,
          thinkingConfig: {
            thinkingLevel: "minimal",
          },
        },
      }),
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const apiMessage =
      data?.error?.message ||
      data?.message ||
      response.statusText ||
      "Gemini request failed";

    console.error("Gemini API Error:", {
      status: response.status,
      statusText: response.statusText,
      error: data,
    });

    throw new Error(`Gemini ${response.status}: ${apiMessage}`);
  }

  const candidate = data?.candidates?.[0];

  if (!candidate) {
    console.error("Gemini returned no candidate:", data);

    throw new Error("Gemini returned no response");
  }

  const text = candidate?.content?.parts
    ?.map((part) => part?.text || "")
    .join("")
    .trim();


  if (!text) {
    console.error("Gemini returned an empty response:", data);

    throw new Error("Gemini returned an empty response");
  }

  const parsed = parseGeminiJson(text);

  if (!parsed) {
    console.error("Gemini returned invalid JSON:", text);
    console.error("Full Gemini response:", data);

    throw new Error("Gemini returned an invalid JSON response");
  }

  return parsed;
};

const getGeminiAiSummary = async (tasks, fallback) => {
  const taskSnapshot = tasks.slice(0, 50).map((task) => ({
    title: task.title,
    status: task.status,
    priority: task.priority,
    category: task.category,
    dueDate: task.dueDate,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  }));

  const prompt = `
    You are helping a user understand their personal task list.

    Generate:
    1. One short summary.
    2. Two to four practical suggestions.

    Rules:
    - Avoid duration or time-spent metrics.
    - Focus on priority, due dates, overdue tasks, and stale tasks.
    - Keep wording concise and action-focused.
    - Do not invent information.
    - Do not include markdown.
    - Do not include code fences.

    Tasks:
    ${JSON.stringify(taskSnapshot)}
    `;

  const responseSchema = {
    type: "object",
    properties: {
      summary: {
        type: "string",
        description: "One short sentence summarizing the user's task list.",
      },
      suggestions: {
        type: "array",
        description: "Two to four practical task-management suggestions.",
        items: {
          type: "string",
        },
        minItems: 2,
        maxItems: 4,
      },
    },
    required: ["summary", "suggestions"],
  };

  try {
    const parsed = await requestGeminiJson({
      prompt,
      responseSchema,
      maxOutputTokens: 1024,
    });

    if (
      !parsed ||
      typeof parsed.summary !== "string" ||
      !Array.isArray(parsed.suggestions)
    ) {
      return fallback;
    }

    return {
      summary: parsed.summary.trim(),

      suggestions: parsed.suggestions
        .filter((suggestion) => typeof suggestion === "string")
        .map((suggestion) => suggestion.trim())
        .filter(Boolean)
        .slice(0, 4),

      source: "gemini",
    };
  } catch (error) {
    console.error("Gemini AI Summary Error:", error);

    return {
      ...fallback,
      aiError: error.message,
    };
  }
};

const getGeminiTaskTextImprovement = async (input) => {
  if (!input || !input.field) {
    throw new Error("Invalid input for AI text improvement");
  }

  const field = String(input.field).trim();

  const title = String(input.title || "").trim();

  const description = String(input.description || "").trim();

  const prompt = `
Improve one task form field while preserving the user's original intent.

Field to improve:
${field}

Current title:
${title}

Current description:
${description}

Rules:
- Fix spelling mistakes and grammar.
- Improve clarity and action focus.
- Do not add facts that were not provided.
- Do not add dates, labels, deadlines, or commitments that were not implied.
- Do not change the meaning of the task.
- If improving a title, make it concise and use title case.
- For titles, use "&" when it makes the action clearer.
- Example: "Update website UI and improve design" -> "Update & Improve Website UI"
- If improving a description, use normal sentence case.
- Do not add labels such as "Better title:".
- Do not use markdown.
- Return only the requested improved text inside the JSON response.
`;

  const responseSchema = {
    type: "object",
    properties: {
      text: {
        type: "string",
        description: "The improved task field text.",
      },
    },
    required: ["text"],
  };

  try {
    const parsed = await requestGeminiJson({
      prompt,
      responseSchema,
      maxOutputTokens: 1024,
    });

    if (!parsed || typeof parsed.text !== "string") {
      throw new Error(
        "AI text improvement returned an invalid response"
      );
    }

    const improvedText = parsed.text.trim();

    if (!improvedText) {
      throw new Error("AI returned empty text");
    }

    return improvedText;
  } catch (error) {
    console.error(
      "Gemini Task Text Improvement Error:",
      error
    );

    throw new Error(
      error.message || "AI text improvement failed"
    );
  }
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
    // validateTaskDates(payload);

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
    // validateTaskDates(payload);

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

    const localSummary = buildLocalAiSummary(tasks);
    const summary = await getGeminiAiSummary(tasks, localSummary);
    res.json(summary);
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate summary",
      error: error.message,
    });
  }
};

const improveTaskText = async (req, res) => {
  try {
    const field = req.body.field;

    if (!["title", "description"].includes(field)) {
      return res.status(400).json({
        message: "Field must be title or description",
      });
    }

    const input = {
      field,
      title: String(req.body.title || "").trim(),
      description: String(req.body.description || "").trim(),
    };

    if (!input.title && !input.description) {
      return res.status(400).json({
        message: "Add a title or description first",
      });
    }

    const text = await getGeminiTaskTextImprovement(input);

    res.json({
      field,
      text,
      source: "gemini",
    });
  } catch (error) {
    res.status(503).json({
      message: error.message || "AI text improvement failed",
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
  improveTaskText,
};
