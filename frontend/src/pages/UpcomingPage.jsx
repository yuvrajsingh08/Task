import TaskBoard from "../components/tasks/TaskBoard";
import { startOfLocalDayISO, useViewFilters } from "../hooks/useViewFilters";

function UpcomingPage() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  useViewFilters({
    dueFrom: startOfLocalDayISO(tomorrow),
    excludeCompleted: true,
  });

  return (
    <TaskBoard
      eyebrow="Schedule"
      title="Upcoming"
      subtitle="Incomplete tasks due after today."
      emptyText="No upcoming tasks."
    />
  );
}

export default UpcomingPage;
