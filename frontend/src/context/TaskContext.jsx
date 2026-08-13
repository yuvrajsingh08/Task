import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import api from "../api";
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
  reminderEmailEnabled: false,
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
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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

  const fetchTasks = async () => {
    setLoading(true);

    try {
      const response = await api.get("/tasks", {
        params: {
          search,
          status: statusFilter,
          priority: priorityFilter,
          category: categoryFilter,
          page,
          pageSize,
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

      const filteredTasks = dueDateFilter
        ? fetchedTasks.filter(
            (task) =>
              formatLocalDate(task.dueDate) === dueDateFilter,
          )
        : fetchedTasks;

      setTasks(filteredTasks);
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

  useEffect(() => {
    setPage(1);
  }, [
    search,
    statusFilter,
    priorityFilter,
    categoryFilter,
    dueDateFilter,
  ]);

  useEffect(() => {
    fetchTasks();
  }, [
    search,
    statusFilter,
    priorityFilter,
    categoryFilter,
    dueDateFilter,
    page,
    pageSize,
  ]);

  useEffect(() => {
    fetchAiSummary();
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
      reminderEmailEnabled: Boolean(form.reminderEmailEnabled),
    };

    try {
      if (editingId) {
        await api.put(`/tasks/${editingId}`, payload);

        const successMessage = "Task updated successfully";
        setMessage(successMessage);
        showToast(successMessage, "success");
      } else {
        await api.post("/tasks", payload);

        const successMessage = "Task added successfully";
        setMessage(successMessage);
        showToast(successMessage, "success");
      }

      resetForm();
      setIsTaskModalOpen(false);

      await fetchTasks();
      await fetchAiSummary();
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
      reminderEmailEnabled: Boolean(
        task.reminderEmailEnabled,
      ),
    });

    setIsTaskModalOpen(true);
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) {
      return;
    }

    try {
      await api.delete(`/tasks/${id}`);

      const successMessage = "Task deleted successfully";
      setMessage(successMessage);
      showToast(successMessage, "success");

      await fetchTasks();
      await fetchAiSummary();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Unable to delete task";

      setMessage(errorMessage);
      showToast(errorMessage, "error");
    }
  };

  const toggleTaskStatus = async (id) => {
    try {
      await api.patch(`/tasks/${id}/toggle`);

      const successMessage = "Task status updated";
      setMessage(successMessage);
      showToast(successMessage, "success");

      await fetchTasks();
      await fetchAiSummary();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Unable to update task status";

      setMessage(errorMessage);
      showToast(errorMessage, "error");
    }
  };

  const updateTaskField = async (id, field, value) => {
    try {
      await api.put(`/tasks/${id}`, {
        [field]: value,
      });

      const successMessage = "Task updated successfully";
      setMessage(successMessage);
      showToast(successMessage, "success");

      await fetchTasks();
      await fetchAiSummary();
    } catch (error) {
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

    aiSummary,
    loading,
    isSaving,
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

    setFormValue,
    updateForm,

    saveTask,
    startEdit,
    openTaskModal,
    closeTaskModal,
    deleteTask,
    toggleTaskStatus,
    updateTaskField,
    resetForm,

    fetchTasks,
    fetchAiSummary,
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