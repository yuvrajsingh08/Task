import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api";
import { useToast } from "./ToastContext";

const TaskContext = createContext();

export const emptyTaskForm = {
  title: "",
  description: "",
  priority: "Medium",
  category: "General",
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
  const [message, setMessage] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);

  const stats = useMemo(() => {
    const completed = tasks.filter(
      (task) => task.status === "Completed",
    ).length;
    const pending = tasks.length - completed;
    const highPriority = tasks.filter(
      (task) => task.status === "Pending" && task.priority === "High",
    ).length;

    return { total: tasks.length, completed, pending, highPriority };
  }, [tasks]);

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

      // Support both paginated and legacy (array) responses
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
            (task) => task.dueDate?.slice(0, 10) === dueDateFilter,
          )
        : fetchedTasks;

      setTasks(filteredTasks);
    } catch (error) {
      const message = error.response?.data?.message || "Unable to load tasks";
      setMessage(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchAiSummary = async () => {
    try {
      const response = await api.get("/tasks/ai-summary");
      setAiSummary(response.data);
    } catch (error) {
      setAiSummary({ summary: "AI summary is unavailable.", suggestions: [] });
    }
  };

  // reset to first page when filters/search change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, priorityFilter, categoryFilter, dueDateFilter]);

  useEffect(() => {
    fetchTasks();
  }, [search, statusFilter, priorityFilter, categoryFilter, dueDateFilter, page, pageSize]);

  useEffect(() => {
    fetchAiSummary();
  }, [tasks.length]);

  const updateForm = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const setFormValue = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyTaskForm);
    setEditingId(null);
  };

  const openTaskModal = () => {
    resetForm();
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    resetForm();
  };

  const saveTask = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      const message = "Task title is required";
      setMessage(message);
      showToast(message, "error");
      return;
    }

    const payload = {
      ...form,
      dueDate: form.dueDate || null,
      reminderAt: form.reminderAt || null,
      reminderEmailEnabled: Boolean(form.reminderEmailEnabled),
    };

    try {
      if (editingId) {
        await api.put(`/tasks/${editingId}`, payload);
        const message = "Task updated successfully";
        setMessage(message);
        showToast(message, "success");
      } else {
        await api.post("/tasks", payload);
        const message = "Task added successfully";
        setMessage(message);
        showToast(message, "success");
      }

      resetForm();
      setIsTaskModalOpen(false);
      await fetchTasks();
      await fetchAiSummary();
    } catch (error) {
      const message = error.response?.data?.message || "Unable to save task";
      setMessage(message);
      showToast(message, "error");
    }
  };

  const startEdit = (task) => {
    setEditingId(task._id);
    setForm({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      category: task.category || "General",
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : "",
      reminderAt: task.reminderAt ? task.reminderAt.slice(0, 16) : "",
      reminderEmailEnabled: Boolean(task.reminderEmailEnabled),
    });
    setIsTaskModalOpen(true);
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) {
      return;
    }

    try {
      await api.delete(`/tasks/${id}`);
      const message = "Task deleted successfully";
      setMessage(message);
      showToast(message, "success");
      await fetchTasks();
      await fetchAiSummary();
    } catch (error) {
      const message = error.response?.data?.message || "Unable to delete task";
      setMessage(message);
      showToast(message, "error");
    }
  };

  const toggleTaskStatus = async (id) => {
    try {
      await api.patch(`/tasks/${id}/toggle`);
      const message = "Task status updated";
      setMessage(message);
      showToast(message, "success");
      await fetchTasks();
      await fetchAiSummary();
    } catch (error) {
      const message =
        error.response?.data?.message || "Unable to update task status";
      setMessage(message);
      showToast(message, "error");
    }
  };

  const updateTaskField = async (id, field, value) => {
    try {
      await api.put(`/tasks/${id}`, { [field]: value });
      const message = "Task updated successfully";
      setMessage(message);
      showToast(message, "success");
      await fetchTasks();
      await fetchAiSummary();
    } catch (error) {
      const message = error.response?.data?.message || "Unable to update task";
      setMessage(message);
      showToast(message, "error");
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
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const context = useContext(TaskContext);

  if (!context) {
    throw new Error("useTasks must be used inside TaskProvider");
  }

  return context;
}
