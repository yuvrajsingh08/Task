import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Circle,
  Flag,
  Folder,
  Mail,
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
      className={`
        group relative flex overflow-hidden rounded-xl border
        shadow-sm transition-all duration-200
        hover:-translate-y-0.5 hover:shadow-md
        ${
          isCompleted
            ? "border-emerald-200 bg-emerald-50/70 dark:border-emerald-800 dark:bg-emerald-950/20"
            : task.pinned
              ? "border-amber-200 bg-amber-50/50 dark:border-amber-500/20 dark:bg-amber-500/5"
              : "border-orange-100 bg-white dark:border-slate-800 dark:bg-slate-900"
        }
      `}
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
        className={`
          w-1 shrink-0
          ${
            isCompleted
              ? "bg-emerald-400"
              : priorityStyle.bar
          }
        `}
        aria-hidden="true"
      />

      <div className="min-w-0 flex-1 px-3 py-2.5 sm:px-4">
        <div className="flex items-start gap-2.5">
          <button
            type="button"
            onClick={handleMenuClick(() =>
              toggleTaskStatus(task._id)
            )}
            className={`
              mt-0.5 shrink-0 transition
              ${statusStyle.text}
              hover:opacity-70
            `}
            aria-label={`Change status from ${task.status}`}
          >
            <StatusIcon
              size={20}
              className={isCompleted ? "fill-current/10" : ""}
            />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              <h3
                className={`
                  min-w-0 break-words
                  text-[15px] font-semibold leading-5
                  sm:text-base
                  ${
                    isCompleted
                      ? "text-slate-500 line-through dark:text-slate-500"
                      : "text-slate-900 dark:text-white"
                  }
                `}
              >
                {task.title}
              </h3>

              <span
                className={`
                  inline-flex shrink-0 items-center gap-1
                  rounded-full px-2 py-0.5
                  text-[10px] font-semibold
                  ${statusStyle.bg}
                  ${statusStyle.text}
                `}
              >
                <StatusIcon size={10} />
                {statusStyle.label}
              </span>

              <span
                className={`
                  inline-flex shrink-0
                  items-center gap-1
                  text-[11px] font-semibold
                  ${priorityStyle.text}
                `}
              >
                <Flag
                  size={11}
                  className="fill-current"
                />
                {task.priority}
              </span>
            </div>

            {task.description ? (
              <p
                className="
                  mt-0.5 line-clamp-1 break-words
                  text-xs leading-5
                  text-slate-500
                  dark:text-slate-400
                "
              >
                {task.description}
              </p>
            ) : (
              <p
                className="
                  mt-0.5
                  text-xs italic leading-5
                  text-slate-400
                  dark:text-slate-600
                "
              >
                No description
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={handleMenuClick(() => togglePin(task._id))}
              className={`rounded-lg p-1.5 transition ${
                task.pinned
                  ? "text-amber-500"
                  : "text-slate-300 hover:text-amber-400 dark:text-slate-600"
              }`}
              aria-label={task.pinned ? "Unpin task" : "Pin task"}
            >
              <Star
                size={16}
                className={task.pinned ? "fill-current" : ""}
              />
            </button>

            <div
              className="
                opacity-60 transition-opacity
                group-hover:opacity-100
              "
              onClick={(event) => event.stopPropagation()}
            >
              <TaskActionMenu
                pinned={task.pinned}
                status={task.status}
                onPin={handleMenuClick(() => togglePin(task._id))}
                onToggle={handleMenuClick(() =>
                  toggleTaskStatus(task._id)
                )}
                onEdit={handleMenuClick(() =>
                  startEdit(task)
                )}
                onDelete={handleMenuClick(() =>
                  deleteTask(task._id)
                )}
              />
            </div>
          </div>
        </div>

        <div
          className="
            mt-2
            flex flex-wrap items-center
            gap-1.5
            pl-[30px]
            text-[11px]
            text-slate-500
            dark:text-slate-400
          "
        >
          <span
            className="
              inline-flex min-w-0 max-w-[180px]
              items-center gap-1.5
              rounded-full
              bg-[#fff4ed]
              px-2 py-1
              dark:bg-slate-800
            "
          >
            <Folder size={12} className="shrink-0" />

            <span className="truncate">
              {task.category || "General"}
            </span>
          </span>

          <span
            className={`
              inline-flex items-center gap-1.5
              rounded-full
              px-2 py-1
              ${
                isOverdue
                  ? `
                    bg-rose-100
                    text-rose-600
                    dark:bg-rose-950/40
                    dark:text-rose-400
                  `
                  : `
                    bg-[#fff4ed]
                    dark:bg-slate-800
                  `
              }
            `}
          >
            <CalendarDays
              size={12}
              className="shrink-0"
            />

            <span>{dueDateLabel}</span>

            {isOverdue && (
              <span className="font-semibold">
                overdue
              </span>
            )}
          </span>

          {reminderLabel && (
            <span
              className="
                inline-flex items-center gap-1.5
                rounded-full
                bg-orange-100
                px-2 py-1
                text-orange-700
                dark:bg-orange-500/15
                dark:text-orange-300
              "
            >
              <Bell size={12} className="shrink-0" />
              {reminderLabel}
            </span>
          )}

          {task.reminderEmailEnabled && (
            <span
              className="
                inline-flex items-center gap-1.5
                rounded-full
                bg-sky-100
                px-2 py-1
                text-sky-700
                dark:bg-sky-500/15
                dark:text-sky-300
              "
            >
              <Mail size={12} className="shrink-0" />

              {task.reminderEmailStatus === "sent"
                ? "Email sent"
                : "Email on"}
            </span>
          )}

          {tags.length > 0 && (
            <>
              {tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="
                    inline-flex max-w-[140px]
                    items-center gap-1
                    rounded-full
                    bg-violet-100
                    px-2 py-1
                    text-violet-700
                    dark:bg-violet-500/15
                    dark:text-violet-300
                  "
                >
                  <Tag size={11} className="shrink-0" />

                  <span className="truncate">
                    {tag}
                  </span>
                </span>
              ))}

              {tags.length > 4 && (
                <span
                  className="
                    inline-flex items-center
                    rounded-full
                    bg-slate-100
                    px-2 py-1
                    font-semibold
                    text-slate-500
                    dark:bg-slate-800
                    dark:text-slate-400
                  "
                >
                  +{tags.length - 4}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  );
}

export default TaskCard;
