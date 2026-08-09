import { useState } from "react";
import EmptyState from "../ui/EmptyState";
import TaskCard from "./TaskCard";
import TaskDetailModal from "./TaskDetailModal";
import { useTasks } from "../../context/TaskContext";

function TaskList() {
  const { loading, tasks } = useTasks();
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
      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </>
  );
}

export default TaskList;
