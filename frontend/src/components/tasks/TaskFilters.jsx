import { CalendarDays, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useTasks } from "../../context/TaskContext";
import SelectField from "../ui/SelectField";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function TaskFilters() {
  const {
    dueDateFilter,
    priorityFilter,
    search,
    setDueDateFilter,
    setPriorityFilter,
    setSearch,
    setStatusFilter,
    statusFilter,
  } = useTasks();
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const baseDate = dueDateFilter ? new Date(`${dueDateFilter}T00:00:00`) : new Date();
    return new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  });

  const calendarDays = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return Array.from({ length: firstDay + daysInMonth }, (_, index) => {
      if (index < firstDay) {
        return null;
      }

      const day = index - firstDay + 1;
      return new Date(year, month, day);
    });
  }, [visibleMonth]);

  const monthLabel = visibleMonth.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const changeMonth = (offset) => {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );
  };

  return (
    <div
      className="mb-4 grid gap-3 rounded-2xl border border-orange-100 bg-white p-3 shadow-sm shadow-orange-100/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none sm:p-4 xl:grid-cols-[minmax(0,1fr)_21rem]"
      id="tasks">
      <div className="grid content-start gap-3 md:grid-cols-[minmax(0,1fr)_12rem_12rem]">
        <label className="flex min-w-0 items-center gap-2 rounded-xl border border-orange-100 bg-[#fff8f4] px-3 py-2.5 dark:border-slate-700 dark:bg-slate-800">
          <Search size={18} className="text-slate-400" />
          <input
            className="min-w-0 w-full bg-transparent text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search task, category, description"
          />
        </label>
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
        {dueDateFilter && (
          <button
            type="button"
            onClick={() => setDueDateFilter("")}
            className="inline-flex w-fit items-center gap-2 rounded-full bg-orange-100 px-3 py-1.5 text-sm font-bold text-orange-700 transition hover:bg-orange-200 dark:bg-orange-500/15 dark:text-orange-300">
            <X size={15} />
            Clear date
          </button>
        )}
      </div>

      <section className="rounded-2xl bg-[#fff4ed] p-3 dark:bg-slate-800/70">
        <div className="mb-3 flex items-center justify-between gap-3">
          <button
            type="button"
            className="rounded-full bg-white p-2 text-slate-600 shadow-sm transition hover:text-slate-950 dark:bg-slate-900 dark:text-slate-300"
            onClick={() => changeMonth(-1)}
            aria-label="Previous month">
            <ChevronLeft size={17} />
          </button>
          <div className="flex items-center gap-2 text-sm font-black text-slate-800 dark:text-slate-100">
            <CalendarDays size={17} className="text-orange-500" />
            {monthLabel}
          </div>
          <button
            type="button"
            className="rounded-full bg-white p-2 text-slate-600 shadow-sm transition hover:text-slate-950 dark:bg-slate-900 dark:text-slate-300"
            onClick={() => changeMonth(1)}
            aria-label="Next month">
            <ChevronRight size={17} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400">
          {WEEKDAYS.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1">
          {calendarDays.map((date, index) =>
            date ? (
              <button
                key={toDateValue(date)}
                type="button"
                onClick={() => setDueDateFilter(toDateValue(date))}
                className={`aspect-square rounded-xl text-xs font-bold transition ${
                  dueDateFilter === toDateValue(date)
                    ? "bg-slate-950 text-white shadow-lg shadow-orange-200 dark:bg-orange-200 dark:text-slate-950 dark:shadow-none"
                    : "bg-white text-slate-600 hover:bg-orange-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}>
                {date.getDate()}
              </button>
            ) : (
              <span key={`empty-${index}`} />
            ),
          )}
        </div>
      </section>
    </div>
  );
}

export default TaskFilters;
