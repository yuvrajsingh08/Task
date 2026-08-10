import { Search, X } from "lucide-react";
import { useMemo } from "react";
import { useTasks } from "../../context/TaskContext";
import SelectField from "../ui/SelectField";

function TaskFilters() {
  const {
    priorityFilter,
    categoryFilter,
    search,
    tasks,
    setPriorityFilter,
    setSearch,
    setStatusFilter,
    setCategoryFilter,
    statusFilter,
  } = useTasks();

  const categoryOptions = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(tasks.map((task) => task.category || "General")),
    ).sort((left, right) => left.localeCompare(right));

    return ["All", ...uniqueCategories];
  }, [tasks]);

  return (
    <div className="w-full space-y-4  py-3">
      {/* Search Bar */}
      <div className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <Search
          size={18}
          className="shrink-0 text-slate-400"
        />

        <input
          type="text"
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search task, category, description"
        />

        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="shrink-0 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <SelectField
          label="Status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={["All", "Pending", "Completed"]}
        />

        <SelectField
          label="Priority"
          value={priorityFilter}
          onChange={setPriorityFilter}
          options={["All", "Low", "Medium", "High"]}
        />

        <SelectField
          label="Category"
          value={categoryFilter}
          onChange={setCategoryFilter}
          options={categoryOptions}
        />
      </div>
    </div>
  );
}

export default TaskFilters;