import TaskBoard from "../components/tasks/TaskBoard";
import { useViewFilters } from "../hooks/useViewFilters";

function MyTasksPage() {
  useViewFilters();

  return (
    <TaskBoard
      eyebrow="Tasks"
      title="My Tasks"
      subtitle="All of your tasks in one place."
      emptyText="You have no tasks yet."
    />
  );
}

export default MyTasksPage;
