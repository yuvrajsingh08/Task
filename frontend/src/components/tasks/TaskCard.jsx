import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Circle,
  Flag,
  Folder,
  PauseCircle,
  PlayCircle,
  Star,
  Tag,
} from "lucide-react";
import { useTasks } from "../../context/TaskContext";
import TaskActionMenu from "./TaskActionMenu";

const PRIORITY_STYLES = {
  High: {
    bar: "bg-rose-500",
    text: "text-rose-600 dark:text-rose-400",
  },
  Medium: {
    bar: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
  },
  Low: {
    bar: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
  },
};

const STATUS_STYLES = {
  Todo: {
    text: "text-slate-600 dark:text-slate-300",
    bg: "bg-slate-100 dark:bg-slate-800",
    icon: Circle,
    label: "Todo",
  },
  Pending: {
    text: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-100 dark:bg-amber-500/15",
    icon: PauseCircle,
    label: "Pending",
  },
  "In Progress": {
    text: "text-blue-700 dark:text-blue-300",
    bg: "bg-blue-100 dark:bg-blue-500/15",
    icon: PlayCircle,
    label: "In Progress",
  },
  Completed: {
    text: "text-emerald-700 dark:text-emerald-300",
    bg: "bg-emerald-100 dark:bg-emerald-500/15",
    icon: CheckCircle2,
    label: "Completed",
  },
};

function TaskCard({ onOpen, task }) {
  const { deleteTask, startEdit, togglePin, toggleTaskStatus } = useTasks();

  const isCompleted = task.status === "Completed";

  const priorityStyle =
    PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.Low;

  const statusStyle =
    STATUS_STYLES[task.status] || STATUS_STYLES.Todo;

  const StatusIcon = statusStyle.icon;

  const dueDateObj = task.dueDate ? new Date(task.dueDate) : null;

  const isOverdue =
    dueDateObj &&
    !isCompleted &&
    dueDateObj.getTime() < Date.now();

  const dueDateLabel = dueDateObj
    ? dueDateObj.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : "No due date";

  const reminderDateObj = task.reminderAt
    ? new Date(task.reminderAt)
    : null;

  const reminderLabel = reminderDateObj
    ? reminderDateObj.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

  const tags = Array.isArray(task.tags) ? task.tags : [];

  const handleMenuClick = (callback) => (event) => {
    event.stopPropagation();
    callback();
  };

  return (
    <article
      className={`group relative flex overflow-hidden rounded-xl border-2 shadow-sm transition-all duration-200 hover:shadow-md ${
        isCompleted
          ? "border-emerald-300 bg-[#dcfce7] dark:border-emerald-700 dark:bg-emerald-950/30"
          : task.pinned
            ? "border-amber-300 bg-[#fff3b0] dark:border-amber-600 dark:bg-amber-950/25"
            : "border-orange-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      }`}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
    >
      <span
        className={`w-1.5 shrink-0 ${
          isCompleted
            ? "bg-emerald-500"
            : task.pinned
              ? "bg-amber-500"
              : priorityStyle.bar
        }`}
        aria-hidden="true"
      />

      <div className="min-w-0 flex-1 px-2.5 py-2 sm:px-3 sm:py-2.5">
        <div className="flex min-w-0 items-start gap-2">
          <button
            type="button"
            onClick={handleMenuClick(() =>
              toggleTaskStatus(task._id),
            )}
            className={`mt-0.5 shrink-0 transition ${
              isCompleted
                ? "text-emerald-700 dark:text-emerald-400"
                : statusStyle.text
            } hover:opacity-70`}
            aria-label={`Change status from ${task.status}`}
          >
            <StatusIcon
              size={17}
              className={isCompleted ? "fill-current/10" : ""}
            />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
              <h3
                className={`min-w-0 break-words text-sm font-semibold leading-4 sm:text-[15px] ${
                  isCompleted
                    ? "text-emerald-800 line-through dark:text-emerald-400"
                    : task.pinned
                      ? "text-amber-950 dark:text-white"
                      : "text-slate-900 dark:text-white"
                }`}
              >
                {task.title}
              </h3>

              <span
                className={`inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${statusStyle.bg} ${statusStyle.text}`}
              >
                <StatusIcon size={9} />
                {statusStyle.label}
              </span>

              <span
                className={`inline-flex shrink-0 items-center gap-0.5 text-[10px] font-semibold ${priorityStyle.text}`}
              >
                <Flag size={10} className="fill-current" />
                {task.priority}
              </span>
            </div>

            {task.description ? (
              <p className={`mt-1 line-clamp-1 break-words text-[11px] leading-4 ${
                isCompleted
                  ? "text-emerald-700/70 dark:text-emerald-400/70"
                  : task.pinned
                    ? "text-amber-800/70 dark:text-slate-300"
                    : "text-slate-500 dark:text-slate-400"
              }`}>
                {task.description}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={handleMenuClick(() =>
                togglePin(task._id),
              )}
              className={`rounded-md p-1 transition ${
                task.pinned
                  ? "text-amber-600"
                  : "text-slate-300 hover:text-amber-400 dark:text-slate-600"
              }`}
              aria-label={task.pinned ? "Unpin task" : "Pin task"}
            >
              <Star
                size={15}
                className={task.pinned ? "fill-current" : ""}
              />
            </button>

            <div
              className="opacity-60 transition-opacity group-hover:opacity-100"
              onClick={(event) => event.stopPropagation()}
            >
              <TaskActionMenu
                pinned={task.pinned}
                status={task.status}
                onPin={handleMenuClick(() =>
                  togglePin(task._id),
                )}
                onToggle={handleMenuClick(() =>
                  toggleTaskStatus(task._id),
                )}
                onEdit={handleMenuClick(() =>
                  startEdit(task),
                )}
                onDelete={handleMenuClick(() =>
                  deleteTask(task._id),
                )}
              />
            </div>
          </div>
        </div>

        <div className="mt-1.5 flex flex-col gap-1.5 pl-[25px] sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
            <span className={`inline-flex min-w-0 max-w-[140px] items-center gap-1 rounded-full px-1.5 py-0.5 ${
              isCompleted
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                : task.pinned
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                  : "bg-orange-50 text-orange-700 dark:bg-slate-800 dark:text-slate-400"
            }`}>
              <Folder size={10} className="shrink-0" />
              <span className="truncate">
                {task.category || "General"}
              </span>
            </span>

            <span
              className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 ${
                isOverdue
                  ? "bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                  : isCompleted
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                    : task.pinned
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                      : "bg-orange-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              <CalendarDays size={10} className="shrink-0" />
              <span>{dueDateLabel}</span>

              {isOverdue && (
                <span className="font-semibold">overdue</span>
              )}
            </span>

            {reminderLabel && (
              <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 ${
                isCompleted
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                  : task.pinned
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                    : "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300"
              }`}>
                <Bell size={10} className="shrink-0" />
                {reminderLabel}
              </span>
            )}

          </div>

          {tags.length > 0 && (
            <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:justify-end">
              {tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex max-w-[120px] items-center gap-0.5 rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"
                >
                  <Tag size={9} className="shrink-0" />
                  <span className="truncate">{tag}</span>
                </span>
              ))}

              {tags.length > 4 && (
                <span className="inline-flex items-center rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  +{tags.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

export default TaskCard;