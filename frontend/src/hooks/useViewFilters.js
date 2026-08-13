import { useEffect } from "react";
import { useTasks } from "../context/TaskContext";

export const startOfLocalDayISO = (value = new Date()) => {
  const date = value instanceof Date ? new Date(value) : new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  date.setHours(0, 0, 0, 0);

  return date.toISOString();
};

export const endOfLocalDayISO = (value = new Date()) => {
  const date = value instanceof Date ? new Date(value) : new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  date.setHours(23, 59, 59, 999);

  return date.toISOString();
};

export function useViewFilters({
  status = "All",
  category = "All",
  dueFrom = "",
  dueTo = "",
  excludeCompleted = false,
} = {}) {
  const {
    setSearch,
    setStatusFilter,
    setPriorityFilter,
    setCategoryFilter,
    setDueDateFilter,
    setDueFrom,
    setDueTo,
    setExcludeCompleted,
    setPinnedOnly,
    setPage,
  } = useTasks();

  useEffect(() => {
    setSearch("");
    setStatusFilter(status);
    setPriorityFilter("All");
    setCategoryFilter(category);
    setDueDateFilter("");
    setDueFrom(dueFrom);
    setDueTo(dueTo);
    setExcludeCompleted(excludeCompleted);
    setPinnedOnly(false);
    setPage(1);
  }, [
    status,
    category,
    dueFrom,
    dueTo,
    excludeCompleted,
    setSearch,
    setStatusFilter,
    setPriorityFilter,
    setCategoryFilter,
    setDueDateFilter,
    setDueFrom,
    setDueTo,
    setExcludeCompleted,
    setPinnedOnly,
    setPage,
  ]);
}
