import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import EmptyState from "../ui/EmptyState";
import TaskCard from "./TaskCard";
import TaskDetailModal from "./TaskDetailModal";
import { useTasks } from "../../context/TaskContext";

function TaskList({ emptyText = "No tasks found." }) {
  const {
    loading,
    tasks,
    page,
    pageSize,
    totalPages,
    totalTasks,
    setPage,
    setPageSize,
  } = useTasks();

  const [selectedTask, setSelectedTask] = useState(null);

  if (loading) {
    return (
      <div className="min-h-[18rem]">
        <EmptyState text="Loading tasks..." />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="min-h-[18rem]">
        <EmptyState text={emptyText} />
      </div>
    );
  }

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalTasks);

  return (
    <>
      <div className="grid min-h-[18rem] content-start gap-3">
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onOpen={() => setSelectedTask(task)}
          />
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-orange-100 bg-white px-3 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            Showing{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {totalTasks > 0 ? `${startItem}-${endItem}` : 0}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {totalTasks}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <div className="flex items-center gap-1.5">
              <label
                htmlFor="page-size"
                className="text-xs text-slate-500 dark:text-slate-400"
              >
                Page size
              </label>

              <select
                id="page-size"
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
                className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 outline-none transition hover:border-orange-300 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-orange-500 dark:focus:ring-orange-500/20"
              >
                {[5, 10, 20, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden h-5 w-px bg-slate-200 sm:block dark:bg-slate-700" />

            <button
              type="button"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-orange-500 dark:hover:bg-orange-500/10 dark:hover:text-orange-400 dark:disabled:hover:border-slate-700 dark:disabled:hover:bg-slate-800 dark:disabled:hover:text-slate-300"
              aria-label="Previous page"
            >
              <ChevronLeft size={15} />
              <span>Prev</span>
            </button>

            <div className="inline-flex h-8 min-w-[64px] items-center justify-center rounded-lg bg-orange-50 px-3 text-xs font-semibold text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
              {page}
              <span className="mx-1 text-orange-300 dark:text-orange-600">
                /
              </span>
              {totalPages}
            </div>

            <button
              type="button"
              onClick={() =>
                setPage(Math.min(totalPages, page + 1))
              }
              disabled={page >= totalPages}
              className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-600 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-orange-500 dark:hover:bg-orange-500/10 dark:hover:text-orange-400 dark:disabled:hover:border-slate-700 dark:disabled:hover:bg-slate-800 dark:disabled:hover:text-slate-300"
              aria-label="Next page"
            >
              <span>Next</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </>
  );
}

export default TaskList;
