import EmptyState from "../ui/EmptyState";
import TaskCard from "./TaskCard";
import { useTasks } from "../../context/TaskContext";

function TaskList() {
  const { loading, tasks } = useTasks();

  if (loading) {
    return <EmptyState text="Loading tasks..." />;
  }

  if (tasks.length === 0) {
    return <EmptyState text="No tasks found." />;
  }

  return (
    <div className="board">
      {tasks.map((task) => (
        <TaskCard key={task._id} task={task} />
      ))}
    </div>
  );
}

export default TaskList;
