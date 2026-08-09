import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api";

const TaskContext = createContext();

export const emptyTaskForm = {
  title: "",
  description: "",
  priority: "Medium",
  category: "General",
  dueDate: ""
};

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyTaskForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [aiSummary, setAiSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const stats = useMemo(() => {
    const completed = tasks.filter((task) => task.status === "Completed").length;
    const pending = tasks.length - completed;
    const highPriority = tasks.filter(
      (task) => task.status === "Pending" && task.priority === "High"
    ).length;

    return { total: tasks.length, completed, pending, highPriority };
  }, [tasks]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await api.get("/tasks", {
        params: { search, status: statusFilter, priority: priorityFilter }
      });
      setTasks(response.data);
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to load tasks");
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

  useEffect(() => {
    fetchTasks();
  }, [search, statusFilter, priorityFilter]);

  useEffect(() => {
    fetchAiSummary();
  }, [tasks.length]);

  const updateForm = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyTaskForm);
    setEditingId(null);
  };

  const saveTask = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setMessage("Task title is required");
      return;
    }

    const payload = {
      ...form,
      dueDate: form.dueDate || null
    };

    try {
      if (editingId) {
        await api.put(`/tasks/${editingId}`, payload);
        setMessage("Task updated successfully");
      } else {
        await api.post("/tasks", payload);
        setMessage("Task added successfully");
      }

      resetForm();
      await fetchTasks();
      await fetchAiSummary();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to save task");
    }
  };

  const startEdit = (task) => {
    setEditingId(task._id);
    setForm({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      category: task.category || "General",
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) {
      return;
    }

    try {
      await api.delete(`/tasks/${id}`);
      setMessage("Task deleted successfully");
      await fetchTasks();
      await fetchAiSummary();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to delete task");
    }
  };

  const toggleTaskStatus = async (id) => {
    try {
      await api.patch(`/tasks/${id}/toggle`);
      await fetchTasks();
      await fetchAiSummary();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to update task status");
    }
  };

  const value = {
    tasks,
    form,
    editingId,
    search,
    statusFilter,
    priorityFilter,
    aiSummary,
    loading,
    message,
    stats,
    setSearch,
    setStatusFilter,
    setPriorityFilter,
    updateForm,
    saveTask,
    startEdit,
    deleteTask,
    toggleTaskStatus,
    resetForm
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
