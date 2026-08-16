import TaskBoard from "../components/tasks/TaskBoard";
import { useViewFilters } from "../hooks/useViewFilters";

function Dashboard() {
  useViewFilters();

  return (
    <TaskBoard
      eyebrow="Project board"
      title="Project Tasks"
      showOverview
      showTaskList={false}
    />
  );
}

export default Dashboard;
