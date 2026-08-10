import { useState } from "react";
import EmptyState from "../ui/EmptyState";
import TaskCard from "./TaskCard";
import TaskDetailModal from "./TaskDetailModal";
import { useTasks } from "../../context/TaskContext";

function TaskList() {
  const { loading, tasks } = useTasks();
  const { page, pageSize, totalPages, totalTasks, setPage, setPageSize } =
    useTasks();
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
        <EmptyState text="No tasks found." />
      </div>
    );
  }

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

      {/* Pagination controls */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-slate-600">
          Showing {tasks.length} of {totalTasks || tasks.length}
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm">Page size</label>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="rounded border px-2 py-1 text-sm"
          >
            {[5, 10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          >
            Prev
          </button>

          <div className="text-sm">
            {page} / {totalPages}
          </div>

          <button
            type="button"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="rounded border px-3 py-1 text-sm disabled:opacity-50"
          >
            Next
          </button>
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
