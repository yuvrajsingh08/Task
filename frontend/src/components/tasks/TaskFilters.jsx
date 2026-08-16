import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Popover from "@radix-ui/react-popover";
import { ArrowUpDown, Check, Filter, Search, Star, X } from "lucide-react";
import { getCategoryColor } from "../../constants/categories";
import { STATUS_FILTER_OPTIONS } from "../../constants/statuses";
import { useTasks } from "../../context/TaskContext";
import SelectField from "../ui/SelectField";

const PRIORITY_OPTIONS = ["All", "Low", "Medium", "High"];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "title", label: "Title A–Z" },
  { value: "dueDate", label: "Due date" },
  { value: "priority", label: "Priority" },
];

function Chip({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-1.5 text-[11px] font-medium transition sm:px-3 sm:text-xs ${
        active
          ? "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 dark:border-orange-600/40 dark:bg-orange-500/10 dark:text-orange-300 dark:hover:bg-orange-500/15"
          : "border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-orange-500/30 dark:hover:bg-orange-500/10 dark:hover:text-orange-300"
      }`}
    >
      {children}
    </button>
  );
}

function TaskFilters({
  hideStatus = false,
  hideCategory = false,
  filteredTasks = null,
}) {
  const {
    categories,
    categoryFilter,
    pinnedOnly,
    priorityFilter,
    search,
    setCategoryFilter,
    setPinnedOnly,
    setPriorityFilter,
    setSearch,
    setSortBy,
    setStatusFilter,
    sortBy,
    statusFilter,
    stats,
  } = useTasks();

  const activeSort =
    SORT_OPTIONS.find((option) => option.value === sortBy) ||
    SORT_OPTIONS[0];

  const allCount = categories.reduce(
    (sum, item) => sum + item.count,
    0
  );

  const hasExtraFilters =
    pinnedOnly ||
    priorityFilter !== "All" ||
    (!hideStatus && statusFilter !== "All");

  const currentTotal = filteredTasks
    ? filteredTasks.length
    : stats.total;

  const currentCompleted = filteredTasks
    ? filteredTasks.filter((task) => {
        const status = String(task.status || "").toLowerCase();
        return status === "completed" || status === "done";
      }).length
    : stats.completed;

  const completionPercentage = currentTotal
    ? Math.round((currentCompleted / currentTotal) * 100)
    : 0;

  return (
    <div className="w-full shrink-0 space-y-2 py-1.5 sm:space-y-2.5 sm:py-2">
      {/* Categories */}
      {!hideCategory && (
        <div className="rounded-xl bg-transparent p-1.5 ">
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible">
            <Chip
              active={categoryFilter === "All"}
              onClick={() => setCategoryFilter("All")}
            >
              All
              <span className="ml-0.5 opacity-60">{allCount}</span>
            </Chip>

            {categories.map((category) => (
              <Chip
                key={category.name}
                active={categoryFilter === category.name}
                onClick={() =>
                  setCategoryFilter(
                    categoryFilter === category.name
                      ? "All"
                      : category.name
                  )
                }
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${getCategoryColor(
                    category.name
                  )}`}
                />

                {category.name}

                <span className="ml-0.5 opacity-60">
                  {category.count}
                </span>
              </Chip>
            ))}

            <Chip
              active={pinnedOnly}
              onClick={() => setPinnedOnly(!pinnedOnly)}
            >
              <Star
                size={12}
                className={pinnedOnly ? "fill-current" : ""}
              />
              Pinned
            </Chip>
          </div>
        </div>
      )}

      {hideCategory && (
        <div className="flex">
          <Chip
            active={pinnedOnly}
            onClick={() => setPinnedOnly(!pinnedOnly)}
          >
            <Star
              size={12}
              className={pinnedOnly ? "fill-current" : ""}
            />
            Pinned
          </Chip>
        </div>
      )}

      {/* Search + controls */}
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="flex h-9 w-full min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-slate-500 shadow-sm transition focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:focus-within:border-orange-500/50 dark:focus-within:ring-orange-500/10 sm:h-9 sm:w-[280px]">
          <Search size={15} className="shrink-0" />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tasks"
            className="min-w-0 flex-1 bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="shrink-0 rounded-full p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="flex min-w-0 items-center gap-1.5 sm:ml-auto">
          {/* Sort */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-orange-500/30 dark:hover:bg-orange-500/10 dark:hover:text-orange-300"
              aria-label={`Sort: ${activeSort.label}`}
              title={`Sort: ${activeSort.label}`}
            >
              <ArrowUpDown size={15} />
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="start"
                sideOffset={8}
                className="z-50 min-w-[170px] rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-900"
              >
                {SORT_OPTIONS.map((option) => (
                  <DropdownMenu.Item
                    key={option.value}
                    onSelect={() => setSortBy(option.value)}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-xs text-slate-700 outline-none hover:bg-orange-50 hover:text-orange-700 dark:text-slate-200 dark:hover:bg-orange-500/10 dark:hover:text-orange-300 sm:px-3 sm:text-sm"
                  >
                    {option.label}

                    {sortBy === option.value && (
                      <Check
                        size={14}
                        className="text-orange-500"
                      />
                    )}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          {/* Filter */}
          <Popover.Root>
            <Popover.Trigger
              className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border shadow-sm transition ${
                hasExtraFilters
                  ? "border-orange-300 bg-orange-50 text-orange-600 hover:bg-orange-100 dark:border-orange-500/40 dark:bg-orange-500/10 dark:text-orange-300 dark:hover:bg-orange-500/15"
                  : "border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-orange-500/30 dark:hover:bg-orange-500/10 dark:hover:text-orange-300"
              }`}
              aria-label="Filters"
              title="Filters"
            >
              <Filter size={15} />

              {hasExtraFilters && (
                <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-orange-500" />
              )}
            </Popover.Trigger>

            <Popover.Portal>
              <Popover.Content
                align="start"
                sideOffset={8}
                className="z-50 w-[min(82vw,280px)] rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900"
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 sm:text-xs">
                    Filters
                  </p>

                  {hasExtraFilters && (
                    <span className="rounded-md bg-orange-50 px-2 py-1 text-[9px] font-semibold text-orange-600 dark:bg-orange-500/10 dark:text-orange-300 sm:text-[10px]">
                      Active
                    </span>
                  )}
                </div>

                {!hideStatus && (
                  <div className="mb-3">
                    <SelectField
                      label="Status"
                      value={statusFilter}
                      onChange={setStatusFilter}
                      options={STATUS_FILTER_OPTIONS}
                    />
                  </div>
                )}

                <div className="mb-3">
                  <SelectField
                    label="Priority"
                    value={priorityFilter}
                    onChange={setPriorityFilter}
                    options={PRIORITY_OPTIONS}
                  />
                </div>

                <label className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200 sm:py-2.5 sm:text-sm">
                  Pinned only

                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 accent-orange-500 sm:h-4 sm:w-4"
                    checked={pinnedOnly}
                    onChange={(event) =>
                      setPinnedOnly(event.target.checked)
                    }
                  />
                </label>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          {/* Completion */}
          <div className="ml-auto flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 py-1.5 dark:border-slate-700 dark:bg-slate-900 sm:ml-1">
            <div
              className="relative flex h-5 w-5 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(rgb(249 115 22) ${completionPercentage}%, rgb(226 232 240) 0)`,
              }}
            >
              <div className="h-3.5 w-3.5 rounded-full bg-white dark:bg-slate-900" />
            </div>

            <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 sm:text-xs">
              {currentCompleted}/{currentTotal}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskFilters;