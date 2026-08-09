import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Flag,
  Folder,
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

function TaskCard({ onOpen, task }) {
  const { deleteTask, startEdit, toggleTaskStatus } = useTasks();
  const isCompleted = task.status === "Completed";
  const priorityStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.Low;

  const dueDateObj = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue =
    dueDateObj && !isCompleted && dueDateObj.getTime() < Date.now();
  const dueDateLabel = dueDateObj
    ? dueDateObj.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : "No due date";

  const handleMenuClick = (callback) => (event) => {
    event.stopPropagation();
    callback();
  };

  return (
    <article
      className={`group relative flex overflow-hidden rounded-2xl border shadow-sm shadow-orange-100/50 transition hover:-translate-y-0.5 hover:shadow-lg ${
        isCompleted
          ? "border-emerald-200 bg-emerald-50/70 dark:border-emerald-800 dark:bg-emerald-950/20"
          : "border-orange-100 bg-white dark:border-slate-800 dark:bg-slate-900"
      }`}
      onClick={onOpen}
      role="button"
      tabIndex="0"
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
    >
      {/* priority accent bar */}
      <span
        className={`w-1 shrink-0 ${isCompleted ? "bg-emerald-400" : priorityStyle.bar}`}
        aria-hidden="true"
      />

      <div className="flex flex-1 flex-col gap-2.5 p-3 sm:p-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={handleMenuClick(() => toggleTaskStatus(task._id))}
            className="mt-0.5 shrink-0 text-slate-400 transition hover:text-emerald-500 dark:text-slate-500 dark:hover:text-emerald-400"
            aria-label={
              isCompleted ? "Mark as pending" : "Mark as completed"
            }
          >
            {isCompleted ? (
              <CheckCircle2 size={22} className="text-emerald-500" />
            ) : (
              <Circle size={22} />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h3
                className={`min-w-0 break-words text-base font-bold leading-tight sm:text-lg ${
                  isCompleted
                    ? "text-slate-500 line-through dark:text-slate-500"
                    : "text-slate-900 dark:text-white"
                }`}
              >
                {task.title}
              </h3>
              <span
                className={`inline-flex items-center gap-1 text-xs font-semibold ${priorityStyle.text}`}
              >
                <Flag size={12} className="fill-current" />
                {task.priority}
              </span>
            </div>

            {task.description ? (
              <p className="mt-1 line-clamp-2 break-words text-sm leading-6 text-slate-600 dark:text-slate-400">
                {task.description}
              </p>
            ) : (
              <p className="mt-1 text-sm italic leading-6 text-slate-400 dark:text-slate-600">
                No description
              </p>
            )}
          </div>

          <div
            className="shrink-0 opacity-60 transition group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <TaskActionMenu
              status={task.status}
              onToggle={handleMenuClick(() => toggleTaskStatus(task._id))}
              onEdit={handleMenuClick(() => startEdit(task))}
              onDelete={handleMenuClick(() => deleteTask(task._id))}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pl-8 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex min-w-0 max-w-[10rem] items-center gap-1.5 rounded-full bg-[#fff4ed] px-2.5 py-1 dark:bg-slate-800">
            <Folder size={13} />
            <span className="truncate">{task.category || "General"}</span>
          </span>
          <span
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 ${
              isOverdue
                ? "bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                : "bg-[#fff4ed] dark:bg-slate-800"
            }`}
          >
            <CalendarDays size={13} />
            {dueDateLabel}
            {isOverdue && <span className="font-semibold">overdue</span>}
          </span>
        </div>
      </div>
    </article>
  );
}

export default TaskCard;
