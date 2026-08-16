import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import api from "../api";
import { getNextTaskStatus } from "../constants/statuses";
import { useToast } from "./ToastContext";

const TaskContext = createContext();

export const emptyTaskForm = {
  title: "",
  description: "",
  status: "Todo",
  priority: "Medium",
  category: "General",
  tags: [],
  dueDate: "",
  reminderAt: "",
};

export function TaskProvider({ children }) {
  const { showToast } = useToast();

  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyTaskForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [dueDateFilter, setDueDateFilter] = useState("");
  const [dueFrom, setDueFrom] = useState("");
  const [dueTo, setDueTo] = useState("");
  const [excludeCompleted, setExcludeCompleted] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [improvingField, setImprovingField] = useState("");
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);

  const savingRef = useRef(false);

  const stats = useMemo(() => {
    const completed = tasks.filter(
      (task) => task.status === "Completed",
    ).length;

    const todo = tasks.filter(
      (task) => task.status === "Todo",
    ).length;

    const pending = tasks.filter(
      (task) => task.status === "Pending",
    ).length;

    const inProgress = tasks.filter(
      (task) => task.status === "In Progress",
    ).length;

    const highPriority = tasks.filter(
      (task) =>
        task.status !== "Completed" &&
        task.priority === "High",
    ).length;

    return {
      total: tasks.length,
      completed,
      todo,
      pending,
      inProgress,
      highPriority,
    };
  }, [tasks]);

  const formatLocalDate = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const formatLocalDateTime = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const toUtcISOStringForDate = (value) => {
    if (!value) return null;

    const date = new Date(`${value}T00:00:00`);

    return Number.isNaN(date.getTime())
      ? null
      : date.toISOString();
  };

  const toUtcISOStringForDateTimeLocal = (value) => {
    if (!value) return null;

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? null
      : date.toISOString();
  };

  const calculateTotalPages = (total) => {
    return Math.max(1, Math.ceil(total / pageSize));
  };

  const fetchTasks = async () => {
    setLoading(true);

    try {
      const dueDateFrom =
        dueFrom ||
        (dueDateFilter ? toUtcISOStringForDate(dueDateFilter) : "");

      const dueDateTo =
        dueTo ||
        (dueDateFilter
          ? new Date(`${dueDateFilter}T23:59:59.999`).toISOString()
          : "");

      const response = await api.get("/tasks", {
        params: {
          search,
          status: statusFilter,
          priority: priorityFilter,
          category: categoryFilter,
          page,
          pageSize,
          ...(dueDateFrom ? { dueFrom: dueDateFrom } : {}),
          ...(dueDateTo ? { dueTo: dueDateTo } : {}),
          ...(excludeCompleted ? { excludeCompleted: true } : {}),
          ...(pinnedOnly ? { pinned: true } : {}),
          sortBy,
        },
      });

      let fetchedTasks = [];

      if (Array.isArray(response.data)) {
        fetchedTasks = response.data;
        setTotalTasks(response.data.length);
        setTotalPages(1);
      } else if (response.data && response.data.tasks) {
        fetchedTasks = response.data.tasks;
        setTotalTasks(response.data.meta?.total || 0);
        setTotalPages(response.data.meta?.totalPages || 1);
      }

      setTasks(fetchedTasks);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Unable to load tasks";

      setMessage(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchAiSummary = async () => {
    try {
      const response = await api.get("/tasks/ai-summary");
      setAiSummary(response.data);
    } catch (error) {
      setAiSummary({
        summary: "AI summary is unavailable.",
        suggestions: [],
      });
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/tasks/categories");
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setCategories([]);
    }
  };

  const improveFormText = async (field) => {
    if (!["title", "description"].includes(field)) {
      return;
    }

    if (!form.title.trim() && !form.description.trim()) {
      const errorMessage = "Add a title or description first";
      setMessage(errorMessage);
      showToast(errorMessage, "error");
      return;
    }

    setImprovingField(field);

    try {
      const response = await api.post("/tasks/improve-text", {
        field,
        title: form.title,
        description: form.description,
      });

      const improvedText = response.data?.text;

      if (!improvedText) {
        throw new Error("Missing improved text");
      }

      setFormValue(field, improvedText);
      showToast(
        field === "title" ? "Title improved" : "Description improved",
        "success",
      );
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Unable to improve task text";

      setMessage(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      setImprovingField("");
    }
  };

  useEffect(() => {
    setPage(1);
  }, [
    search,
    statusFilter,
    priorityFilter,
    categoryFilter,
    dueDateFilter,
    dueFrom,
    dueTo,
    excludeCompleted,
    pinnedOnly,
    sortBy,
  ]);

  useEffect(() => {
    fetchTasks();
  }, [
    search,
    statusFilter,
    priorityFilter,
    categoryFilter,
    dueDateFilter,
    dueFrom,
    dueTo,
    excludeCompleted,
    pinnedOnly,
    sortBy,
    page,
    pageSize,
  ]);

  useEffect(() => {
    fetchAiSummary();
    fetchCategories();
  }, [tasks.length]);

  const updateForm = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const setFormValue = (name, value) => {
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      ...emptyTaskForm,
      tags: [],
    });

    setEditingId(null);
  };

  const openTaskModal = () => {
    resetForm();
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    if (isSaving) return;

    setIsTaskModalOpen(false);
    resetForm();
  };

  const saveTask = async (event) => {
    event.preventDefault();

    if (savingRef.current) {
      return;
    }

    if (!form.title.trim()) {
      const errorMessage = "Task title is required";
      setMessage(errorMessage);
      showToast(errorMessage, "error");
      return;
    }

    savingRef.current = true;
    setIsSaving(true);

    const payload = {
      ...form,
      title: form.title.trim(),
      category: form.category.trim(),
      tags: Array.isArray(form.tags)
        ? form.tags
            .map((tag) => String(tag).trim())
            .filter(Boolean)
        : [],
      dueDate: toUtcISOStringForDate(form.dueDate),
      reminderAt: toUtcISOStringForDateTimeLocal(form.reminderAt),
    };

    try {
      if (editingId) {
        const previousTask = tasks.find(
          (task) => task._id === editingId,
        );

        const optimisticTask = {
          ...previousTask,
          ...payload,
          _id: editingId,
        };

        setTasks((currentTasks) =>
          currentTasks.map((task) =>
            task._id === editingId
              ? optimisticTask
              : task,
          ),
        );

        try {
          const response = await api.put(
            `/tasks/${editingId}`,
            payload,
          );

          const updatedTask =
            response.data?.task ||
            response.data;

          if (updatedTask && updatedTask._id) {
            setTasks((currentTasks) =>
              currentTasks.map((task) =>
                task._id === editingId
                  ? updatedTask
                  : task,
              ),
            );
          }

          const successMessage = "Task updated successfully";
          setMessage(successMessage);
          showToast(successMessage, "success");
        } catch (error) {
          setTasks((currentTasks) =>
            currentTasks.map((task) =>
              task._id === editingId
                ? previousTask
                : task,
            ),
          );

          throw error;
        }
      } else {
        const response = await api.post("/tasks", payload);

        const createdTask =
          response.data?.task ||
          response.data;

        if (createdTask && createdTask._id) {
          setTotalTasks((current) => current + 1);

          if (page === 1) {
            setTasks((currentTasks) => [
              createdTask,
              ...currentTasks,
            ]);
          }
        }

        const successMessage = "Task added successfully";
        setMessage(successMessage);
        showToast(successMessage, "success");
      }

      resetForm();
      setIsTaskModalOpen(false);

      await fetchAiSummary();
      await fetchCategories();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Unable to save task";

      setMessage(errorMessage);
      showToast(errorMessage, "error");
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  const startEdit = (task) => {
    setEditingId(task._id);

    setForm({
      title: task.title || "",
      description: task.description || "",
      status: task.status || "Todo",
      priority: task.priority || "Medium",
      category: task.category || "General",
      tags: Array.isArray(task.tags) ? task.tags : [],
      dueDate: task.dueDate
        ? formatLocalDate(task.dueDate)
        : "",
      reminderAt: task.reminderAt
        ? formatLocalDateTime(task.reminderAt)
        : "",
    });

    setIsTaskModalOpen(true);
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) {
      return;
    }

    const deletedTask = tasks.find(
      (task) => task._id === id,
    );

    if (!deletedTask) {
      return;
    }

    const previousTasks = tasks;

    // Optimistically remove the task from the UI.
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task._id !== id),
    );

    setTotalTasks((currentTotal) => {
      const newTotal = Math.max(0, currentTotal - 1);

      const newTotalPages = calculateTotalPages(newTotal);

      setTotalPages(newTotalPages);

      if (page > newTotalPages) {
        setPage(newTotalPages);
      }

      return newTotal;
    });

    try {
      await api.delete(`/tasks/${id}`);

      const successMessage = "Task deleted successfully";
      setMessage(successMessage);
      showToast(successMessage, "success");

      await fetchAiSummary();
      await fetchCategories();
    } catch (error) {
      // Rollback the optimistic delete.
      setTasks(previousTasks);

      setTotalTasks((currentTotal) => currentTotal + 1);

      setTotalPages((currentTotalPages) =>
        Math.max(
          currentTotalPages,
          calculateTotalPages(totalTasks),
        ),
      );

      const errorMessage =
        error.response?.data?.message ||
        "Unable to delete task";

      setMessage(errorMessage);
      showToast(errorMessage, "error");
    }
  };

  const toggleTaskStatus = async (id) => {
    const previousTasks = tasks;

    const currentTask = tasks.find(
      (task) => task._id === id,
    );

    if (!currentTask) {
      return;
    }

    const nextStatus = getNextTaskStatus(currentTask.status);

    // Optimistically update the status.
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task._id === id
          ? {
              ...task,
              status: nextStatus,
            }
          : task,
      ),
    );

    try {
      const response = await api.patch(
        `/tasks/${id}/toggle`,
      );

      const updatedTask =
        response.data?.task ||
        response.data;

      if (updatedTask && updatedTask._id) {
        setTasks((currentTasks) =>
          currentTasks.map((task) =>
            task._id === id
              ? updatedTask
              : task,
          ),
        );
      }

      const successMessage = "Task status updated";
      setMessage(successMessage);
      showToast(successMessage, "success");

      await fetchAiSummary();
      await fetchCategories();
    } catch (error) {
      // Rollback.
      setTasks(previousTasks);

      const errorMessage =
        error.response?.data?.message ||
        "Unable to update task status";

      setMessage(errorMessage);
      showToast(errorMessage, "error");
    }
  };

  const togglePin = async (id) => {
    const previousTasks = tasks;

    const currentTask = tasks.find(
      (task) => task._id === id,
    );

    if (!currentTask) {
      return;
    }

    const nextPinned = !Boolean(currentTask.pinned);

    // Optimistically update pin.
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task._id === id
          ? {
              ...task,
              pinned: nextPinned,
            }
          : task,
      ),
    );

    try {
      const response = await api.patch(
        `/tasks/${id}/pin`,
      );

      const updatedTask =
        response.data?.task ||
        response.data;

      if (updatedTask && updatedTask._id) {
        setTasks((currentTasks) =>
          currentTasks.map((task) =>
            task._id === id
              ? updatedTask
              : task,
          ),
        );
      }

      await fetchCategories();
    } catch (error) {
      // Rollback.
      setTasks(previousTasks);

      const errorMessage =
        error.response?.data?.message ||
        "Unable to update pin";

      setMessage(errorMessage);
      showToast(errorMessage, "error");
    }
  };

  const updateTaskField = async (id, field, value) => {
    const previousTasks = tasks;

    const currentTask = tasks.find(
      (task) => task._id === id,
    );

    if (!currentTask) {
      return;
    }

    // Optimistically update the field.
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task._id === id
          ? {
              ...task,
              [field]: value,
            }
          : task,
      ),
    );

    try {
      const response = await api.put(
        `/tasks/${id}`,
        {
          [field]: value,
        },
      );

      const updatedTask =
        response.data?.task ||
        response.data;

      if (updatedTask && updatedTask._id) {
        setTasks((currentTasks) =>
          currentTasks.map((task) =>
            task._id === id
              ? updatedTask
              : task,
          ),
        );
      }

      const successMessage = "Task updated successfully";
      setMessage(successMessage);
      showToast(successMessage, "success");

      await fetchAiSummary();
      await fetchCategories();
    } catch (error) {
      // Rollback.
      setTasks(previousTasks);

      const errorMessage =
        error.response?.data?.message ||
        "Unable to update task";

      setMessage(errorMessage);
      showToast(errorMessage, "error");
    }
  };

  const value = {
    tasks,
    page,
    pageSize,
    totalPages,
    totalTasks,

    form,
    editingId,

    search,
    statusFilter,
    priorityFilter,
    categoryFilter,
    dueDateFilter,
    dueFrom,
    dueTo,
    excludeCompleted,
    sortBy,
    pinnedOnly,
    categories,

    aiSummary,
    loading,
    isSaving,
    improvingField,
    message,
    stats,
    isTaskModalOpen,

    setSearch,
    setStatusFilter,
    setPriorityFilter,
    setCategoryFilter,
    setPage,
    setPageSize,
    setDueDateFilter,
    setDueFrom,
    setDueTo,
    setExcludeCompleted,
    setSortBy,
    setPinnedOnly,

    setFormValue,
    updateForm,
    improveFormText,

    saveTask,
    startEdit,
    openTaskModal,
    closeTaskModal,
    deleteTask,
    toggleTaskStatus,
    togglePin,
    updateTaskField,
    resetForm,

    fetchTasks,
    fetchAiSummary,
    fetchCategories,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);

  if (!context) {
    throw new Error(
      "useTasks must be used inside TaskProvider",
    );
  }

  return context;
}
