import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Popover from "@radix-ui/react-popover";
import { ArrowUpDown, Check, Filter, Search, Star, X } from "lucide-react";
import { getCategoryColor } from "../../constants/categories";
import { useTasks } from "../../context/TaskContext";
import ScrollRow from "../ui/ScrollRow";
import SelectField from "../ui/SelectField";

const STATUS_OPTIONS = ["All", "Todo", "Pending", "In Progress", "Completed"];
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
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold whitespace-nowrap transition ${
        active
          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
      }`}
    >
      {children}
    </button>
  );
}

function TaskFilters({ hideStatus = false, hideCategory = false }) {
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
  } = useTasks();

  const activeSort =
    SORT_OPTIONS.find((option) => option.value === sortBy) || SORT_OPTIONS[0];
  const allCount = categories.reduce((sum, item) => sum + item.count, 0);
  const hasExtraFilters =
    pinnedOnly ||
    priorityFilter !== "All" ||
    (!hideStatus && statusFilter !== "All");

  return (
    <div className="w-full space-y-3 py-3">
      {!hideCategory && (
        <ScrollRow>
          <Chip
            active={categoryFilter === "All"}
            onClick={() => setCategoryFilter("All")}
          >
            All
            <span className="text-xs opacity-70">{allCount}</span>
          </Chip>

          {categories.map((category) => (
            <Chip
              key={category.name}
              active={categoryFilter === category.name}
              onClick={() =>
                setCategoryFilter(
                  categoryFilter === category.name ? "All" : category.name,
                )
              }
            >
              <span
                className={`h-2 w-2 rounded-full ${getCategoryColor(category.name)}`}
              />
              {category.name}
              <span className="text-xs opacity-70">{category.count}</span>
            </Chip>
          ))}

          <Chip
            active={pinnedOnly}
            onClick={() => setPinnedOnly(!pinnedOnly)}
          >
            <Star
              size={13}
              className={pinnedOnly ? "fill-current" : ""}
            />
            Pinned
          </Chip>
        </ScrollRow>
      )}

      {hideCategory && (
        <ScrollRow>
          <Chip
            active={pinnedOnly}
            onClick={() => setPinnedOnly(!pinnedOnly)}
          >
            <Star
              size={13}
              className={pinnedOnly ? "fill-current" : ""}
            />
            Pinned
          </Chip>
        </ScrollRow>
      )}

      <div className="flex items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <Search size={16} className="shrink-0 text-slate-400" />

          <input
            type="text"
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tasks"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="shrink-0 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label="Sort tasks"
          >
            <ArrowUpDown size={16} />
            <span className="hidden sm:inline">{activeSort.label}</span>
          </DropdownMenu.Trigger>

          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className="z-50 min-w-[180px] rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-900"
            >
              {SORT_OPTIONS.map((option) => (
                <DropdownMenu.Item
                  key={option.value}
                  onSelect={() => setSortBy(option.value)}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {option.label}
                  {sortBy === option.value && <Check size={15} />}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        <Popover.Root>
          <Popover.Trigger
            className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border shadow-sm transition ${
              hasExtraFilters
                ? "border-orange-300 bg-orange-50 text-orange-600 dark:border-orange-500/40 dark:bg-orange-500/10 dark:text-orange-300"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            }`}
            aria-label="More filters"
          >
            <Filter size={16} />
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content
              align="end"
              sideOffset={8}
              className="z-50 w-[min(92vw,260px)] rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900"
            >
              <p className="mb-3 text-xs font-black uppercase tracking-wide text-slate-400">
                Filters
              </p>

              {!hideStatus && (
                <div className="mb-3">
                  <SelectField
                    label="Status"
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={STATUS_OPTIONS}
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

              <label className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-200">
                Pinned only
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-orange-400"
                  checked={pinnedOnly}
                  onChange={(event) => setPinnedOnly(event.target.checked)}
                />
              </label>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
    </div>
  );
}

export default TaskFilters;
