import {
  AlertTriangle,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  Clock,
  Flag,
  FolderOpen,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Topbar from "../components/layout/Topbar";
import TaskDetailModal from "../components/tasks/TaskDetailModal";
import TaskForm from "../components/tasks/TaskForm";
import { useTasks } from "../context/TaskContext";
import { useViewFilters } from "../hooks/useViewFilters";

const DAY_MS = 24 * 60 * 60 * 1000;

const priorityScore = {
  High: 35,
  Medium: 20,
  Low: 10,
};

const startOfDay = (value = new Date()) => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

const endOfDay = (value = new Date()) => {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
};

const startOfWeek = (value = new Date()) => {
  const date = startOfDay(value);
  const day = date.getDay();
  const diff = day === 0 ? 6 : day - 1;

  date.setDate(date.getDate() - diff);

  return date;
};

const isIncomplete = (task) => task.status !== "Completed";

const getTaskDate = (task, field) => {
  if (!task[field]) return null;

  const date = new Date(task[field]);

  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value) => {
  const date = value ? new Date(value) : null;

  if (!date || Number.isNaN(date.getTime())) {
    return "No due date";
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
};

const getNextTask = (tasks) => {
  const today = startOfDay();

  return tasks
    .filter(isIncomplete)
    .map((task) => {
      const dueDate = getTaskDate(task, "dueDate");
      const createdAt = getTaskDate(task, "createdAt") || today;

      const ageDays = Math.max(
        0,
        Math.floor((today - createdAt) / DAY_MS)
      );

      const dueDays = dueDate
        ? Math.ceil(
            (startOfDay(dueDate) - today) / DAY_MS
          )
        : null;

      let score = priorityScore[task.priority] || 10;

      if (dueDays !== null && dueDays < 0) {
        score += 60 + Math.min(Math.abs(dueDays), 14);
      } else if (dueDays === 0) {
        score += 45;
      } else if (dueDays !== null && dueDays <= 3) {
        score += 30 - dueDays * 4;
      } else if (dueDays === null) {
        score += Math.min(ageDays, 14);
      }

      score += Math.min(ageDays, 20);

      return {
        ...task,
        focusScore: score,
      };
    })
    .sort((a, b) => b.focusScore - a.focusScore)[0];
};

const getDashboardData = (tasks) => {
  const todayStart = startOfDay();
  const todayEnd = endOfDay();
  const weekStart = startOfWeek();

  const completed = tasks.filter(
    (task) => task.status === "Completed"
  );

  const incomplete = tasks.filter(isIncomplete);

  const overdue = incomplete.filter((task) => {
    const dueDate = getTaskDate(task, "dueDate");

    return dueDate && dueDate < todayStart;
  });

  const dueToday = incomplete.filter((task) => {
    const dueDate = getTaskDate(task, "dueDate");

    return (
      dueDate &&
      dueDate >= todayStart &&
      dueDate <= todayEnd
    );
  });

  const highPriority = incomplete.filter(
    (task) => task.priority === "High"
  );

  const completedThisWeek = completed.filter((task) => {
    const updatedAt = getTaskDate(task, "updatedAt");

    return updatedAt && updatedAt >= weekStart;
  });

  const weekTrend = Array.from(
    { length: 7 },
    (_, index) => {
      const date = new Date(weekStart);

      date.setDate(date.getDate() + index);

      const nextDate = new Date(date);

      nextDate.setDate(nextDate.getDate() + 1);

      return {
        label: date
          .toLocaleDateString(undefined, {
            weekday: "short",
          })
          .slice(0, 1),

        value: completed.filter((task) => {
          const updatedAt = getTaskDate(
            task,
            "updatedAt"
          );

          return (
            updatedAt &&
            updatedAt >= date &&
            updatedAt < nextDate
          );
        }).length,
      };
    }
  );

  return {
    completed,
    incomplete,
    overdue,
    dueToday,
    highPriority,
    completedThisWeek,
    weekTrend,

    completionRate: tasks.length
      ? Math.round(
          (completed.length / tasks.length) * 100
        )
      : 0,
  };
};


function StatTile({
  icon,
  label,
  value,
  surface,
  iconTone,
  iconBg = "bg-white",
}) {
  return (
    <div
      className={`group relative min-h-[130px] overflow-hidden rounded-2xl p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg xl:min-h-[145px] xl:p-5 ${
        surface || "bg-orange-50"
      }`}
    >
      {/* Large decorative watermark */}
      <div
        className={`pointer-events-none absolute -bottom-5 -right-5 flex h-28 w-28 rotate-[-8deg] items-center justify-center opacity-[0.14] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-14deg] ${iconTone}`}
      >
        <div className="scale-[4.5]">
          {icon}
        </div>
      </div>

      {/* Top decorative shape */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rotate-12 rounded-[30px] bg-white/20 transition-transform duration-300 group-hover:rotate-[20deg] group-hover:scale-110" />

      {/* Small decorative shape */}
      <div className="pointer-events-none absolute right-8 top-8 h-10 w-10 rotate-12 rounded-xl bg-white/10" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col">
        {/* Icon */}
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-full ${iconBg} ${iconTone} shadow-sm ring-1 ring-black/5 transition-transform duration-200 group-hover:scale-110`}
        >
          {icon}
        </div>

        {/* Value + Label */}
        <div className="mt-auto">
          <p className="text-[28px] font-bold leading-none tracking-tight text-slate-900 xl:text-[32px]">
            {value}
          </p>

          <p className="mt-1.5 text-[11px] font-semibold text-slate-700 xl:text-xs">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}


function Dashboard() {
  useViewFilters();

  const {
    aiSummary,
    loading,
    pageSize,
    setPage,
    setPageSize,
    tasks,
  } = useTasks();

  const [selectedTask, setSelectedTask] =
    useState(null);

  const previousPageSizeRef = useRef(pageSize);

  useEffect(() => {
    setPage(1);
    setPageSize(100);

    return () => {
      setPageSize(previousPageSizeRef.current);
    };
  }, [setPage, setPageSize]);

  const dashboard = useMemo(
    () => getDashboardData(tasks),
    [tasks]
  );

  const nextTask = useMemo(
    () => getNextTask(tasks),
    [tasks]
  );

  const maxTrend = Math.max(
    1,
    ...dashboard.weekTrend.map(
      (item) => item.value
    )
  );

  const attentionItems = [
    {
      label: "Overdue",
      value: dashboard.overdue.length,
      helper: "Past due incomplete tasks",
      emptyHelper: "No overdue tasks",
      icon: <AlertTriangle size={16} />,
      task: dashboard.overdue[0],
    },

    {
      label: "Due Today",
      value: dashboard.dueToday.length,
      helper: "Needs a decision today",
      emptyHelper: "Nothing due today",
      icon: <CalendarClock size={16} />,
      task: dashboard.dueToday[0],
    },

    {
      label: "High Priority",
      value: dashboard.highPriority.length,
      helper: "Important incomplete tasks",
      emptyHelper: "No high-priority blockers",
      icon: <Flag size={16} />,
      task: dashboard.highPriority[0],
    },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="shrink-0">
        <Topbar
          title="Dashboard"
          subtitle="Your next action, attention list, and progress at a glance."
        />

        <TaskForm />
      </div>

      {/* Scrollable content */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-0 pb-4 xl:px-1">
        <div className="mx-auto w-full max-w-[1600px]">

          {/* Top dashboard sections */}
          <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr] xl:gap-4 2xl:gap-5">

            {/* Next Task */}
            <section className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm shadow-orange-100/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none xl:p-5 2xl:p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400">
                  <Sparkles size={18} />
                </div>

                <div>
                  <h2 className="text-base font-black tracking-tight text-slate-950 dark:text-white xl:text-lg">
                    What should I do next?
                  </h2>

                  <p className="text-xs text-slate-500 dark:text-slate-400 xl:text-sm">
                    Ranked by priority, due date, overdue status, and task age.
                  </p>
                </div>
              </div>

              {loading ? (
                <p className="rounded-xl bg-orange-50 px-3 py-4 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                  Loading your focus task...
                </p>
              ) : nextTask ? (
                <div className="rounded-xl bg-orange-50 p-4 dark:bg-slate-800 xl:p-5">
                  <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <span className="rounded-md bg-white px-2 py-1 text-orange-700 dark:bg-slate-900 dark:text-orange-300">
                      {nextTask.priority} priority
                    </span>

                    <span>
                      {nextTask.status}
                    </span>

                    <span>
                      {formatDate(nextTask.dueDate)}
                    </span>
                  </div>

                  <h3 className="break-words text-xl font-black text-slate-950 dark:text-white xl:text-2xl">
                    {nextTask.title}
                  </h3>

                  {nextTask.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-300 xl:text-base">
                      {nextTask.description}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedTask(nextTask)
                    }
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-orange-200 dark:text-slate-950 dark:hover:bg-orange-100"
                  >
                    <FolderOpen size={16} />
                    Open Task
                  </button>
                </div>
              ) : (
                <p className="rounded-xl bg-emerald-50 px-3 py-4 text-sm font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  No pending tasks. You are clear for now.
                </p>
              )}

              {aiSummary?.suggestions?.[0] && (
                <p className="mt-3 rounded-lg border border-orange-100 px-3 py-2 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  Smart note:{" "}
                  {aiSummary.suggestions[0]}
                </p>
              )}
            </section>

            {/* Needs Attention */}
            <section className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm shadow-orange-100/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none xl:p-5 2xl:p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400">
                  <AlertTriangle size={18} />
                </div>

                <div>
                  <h2 className="text-base font-black tracking-tight text-slate-950 dark:text-white xl:text-lg">
                    Needs attention
                  </h2>

                  <p className="text-xs text-slate-500 dark:text-slate-400 xl:text-sm">
                    Review the tasks most likely to slip.
                  </p>
                </div>
              </div>

              <div className="grid gap-2 xl:gap-2.5">
                {attentionItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between gap-3 rounded-xl border border-orange-100 bg-orange-50 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-800 xl:px-4 xl:py-3"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={
                          item.task
                            ? "text-orange-600 dark:text-orange-300"
                            : "text-emerald-600 dark:text-emerald-300"
                        }
                      >
                        {item.task ? (
                          item.icon
                        ) : (
                          <CheckCircle2 size={16} />
                        )}
                      </span>

                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-slate-900 dark:text-white">
                          {item.value} {item.label}
                        </span>

                        <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                          {item.task
                            ? item.helper
                            : item.emptyHelper}
                        </span>
                      </span>
                    </div>

                    {item.task ? (
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedTask(item.task)
                        }
                        className="shrink-0 rounded-lg border border-orange-200 bg-white px-3 py-1.5 text-xs font-semibold text-orange-700 transition hover:bg-orange-100 dark:border-slate-700 dark:bg-slate-900 dark:text-orange-300 dark:hover:bg-slate-800"
                      >
                        Review
                      </button>
                    ) : (
                      <span className="shrink-0 rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-slate-900 dark:text-emerald-300">
                        Clear
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Productivity */}
          <div className="mt-3 xl:mt-4">
            <section className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm shadow-orange-100/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none xl:p-5 2xl:p-6">

              {/* Section Header */}
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400">
                  <BarChart3 size={18} />
                </div>

                <div>
                  <h2 className="text-base font-black tracking-tight text-slate-950 dark:text-white xl:text-lg">
                    Personal productivity
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 xl:text-sm">
                    Based on task status and recent completion updates.
                  </p>
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:gap-3.5">

                {/* Completed */}
                <StatTile
                  icon={<CheckCircle2 size={16} />}
                  label="Completed"
                  value={dashboard.completed.length}
                  surface="bg-[#FFE34F]"
                  iconTone="text-emerald-700"
                />

                {/* Pending */}
                <StatTile
                  icon={<Clock size={16} />}
                  label="Pending"
                  value={dashboard.incomplete.length}
                  surface="bg-[#FFBFAE]"
                  iconTone="text-orange-700"
                />

                {/* Overdue */}
                <StatTile
                  icon={<AlertTriangle size={16} />}
                  label="Overdue"
                  value={dashboard.overdue.length}
                  surface="bg-[#FFB08C]"
                  iconTone="text-red-700"
                />

                {/* Completion Rate */}
                <StatTile
                  icon={<BarChart3 size={16} />}
                  label="Completion rate"
                  value={`${dashboard.completionRate}%`}
                  surface="bg-[#70D3F7]"
                  iconTone="text-sky-700"
                />

                {/* Done This Week */}
                <StatTile
                  icon={<CalendarClock size={16} />}
                  label="Done this week"
                  value={dashboard.completedThisWeek.length}
                  surface="bg-[#A9E99E]"
                  iconTone="text-green-700"
                />
              </div>

              {/* Weekly Trend */}
              <div className="mt-4 rounded-xl border border-orange-100 p-3 dark:border-slate-800 xl:p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-slate-900 dark:text-white xl:text-base">
                    Weekly completion trend
                  </p>

                  <p className="text-xs font-semibold text-orange-600 dark:text-orange-300 xl:text-sm">
                    This week:{" "}
                    {dashboard.completedThisWeek.length}
                  </p>
                </div>

                <div className="flex h-32 items-end gap-2 xl:h-36 2xl:h-40">
                  {dashboard.weekTrend.map(
                    (item, index) => (
                      <div
                        key={`${item.label}-${index}`}
                        className="flex min-w-0 flex-1 flex-col items-center gap-1"
                      >
                        <div className="flex h-20 w-full items-end rounded-md bg-[#fff4ed] dark:bg-slate-800 xl:h-24 2xl:h-28">
                          <div
                            className="flex w-full items-start justify-center rounded-md bg-orange-400 pt-1 text-[10px] font-black text-white dark:bg-orange-300 dark:text-slate-950"
                            style={{
                              height:
                                item.value > 0
                                  ? `${Math.max(
                                      18,
                                      (item.value /
                                        maxTrend) *
                                        100
                                    )}%`
                                  : "0%",
                            }}
                            title={`${item.value} completed`}
                          >
                            {item.value > 0
                              ? item.value
                              : ""}
                          </div>
                        </div>

                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                          {item.label}
                        </span>
                      </div>
                    )
                  )}
                </div>

                {dashboard.completedThisWeek.length ===
                  0 && (
                  <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
                    Completed tasks will appear here as
                    you finish work this week.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Task Modal */}
      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
}

export default Dashboard;