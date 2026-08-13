import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import EmptyState from "../ui/EmptyState";
import TaskCard from "./TaskCard";
import TaskDetailModal from "./TaskDetailModal";
import { useTasks } from "../../context/TaskContext";

export function TaskListPagination() {
  const { page, pageSize, totalPages, totalTasks, setPage, setPageSize } =
    useTasks();

  if (totalTasks === 0) return null;

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalTasks);

  return (
    <div className="shrink-0 border-t border-orange-100 bg-white px-2 py-1.5 safe-bottom dark:border-slate-800 dark:bg-slate-900 sm:px-3">
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
        <p className="text-[10px] text-slate-500 sm:text-[11px] dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {startItem}-{endItem}
          </span>
          {" / "}
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {totalTasks}
          </span>
        </p>

       <div className="flex flex-wrap items-center gap-1">
      <select
        id="page-size"
        value={pageSize}
        onChange={(event) => {
          setPageSize(Number(event.target.value));
          setPage(1);
        }}
        aria-label="Tasks per page"
        className="h-7 min-w-[42px] cursor-pointer rounded-md border border-slate-200 bg-white px-1.5 text-center text-[10px] font-semibold text-slate-600 outline-none transition hover:border-orange-300 hover:bg-orange-50 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-orange-500/40 dark:hover:bg-orange-500/10 dark:focus:border-orange-500/40 dark:focus:ring-orange-500/10 sm:min-w-[46px] sm:px-2"
      >
        {[5, 10, 20, 50, 100].map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>

      <button
        type="button"
        onClick={() => setPage(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-orange-300 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        aria-label="Previous page"
      >
        <ChevronLeft size={14} />
      </button>

      <span className="inline-flex h-7 min-w-[44px] items-center justify-center rounded-md bg-orange-50 px-2 text-[10px] font-semibold text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
        {page}/{totalPages}
      </span>

      <button
        type="button"
        onClick={() => setPage(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-orange-300 hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
        aria-label="Next page"
      >
        <ChevronRight size={14} />
      </button>
    </div>
      </div>
    </div>
  );
}

export function TaskListContent({ emptyText = "No tasks found." }) {
  const { loading, tasks } = useTasks();
  const [selectedTask, setSelectedTask] = useState(null);

  if (loading) {
    return (
      <div className="flex min-h-[8rem] items-center justify-center">
        <EmptyState text="Loading tasks..." />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex min-h-[8rem] items-center justify-center">
        <EmptyState text={emptyText} />
      </div>
    );
  }

  return (
    <>
      <div className="grid content-start gap-1.5 pb-1">
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onOpen={() => setSelectedTask(task)}
          />
        ))}
      </div>

      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </>
  );
}

function TaskList({ emptyText = "No tasks found." }) {
  return (
    <>
      <TaskListContent emptyText={emptyText} />
      <TaskListPagination />
    </>
  );
}

export default TaskList;