import TaskBoard from "../components/tasks/TaskBoard";
import { useViewFilters } from "../hooks/useViewFilters";

function CompletedPage() {
  useViewFilters({ status: "Completed" });

  return (
    <TaskBoard
      eyebrow="Organize"
      title="Completed"
      subtitle="Tasks you have already finished."
      hideStatusFilter
      emptyText="No completed tasks yet."
    />
  );
}

export default CompletedPage;
