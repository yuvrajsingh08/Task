import TaskBoard from "../components/tasks/TaskBoard";
import {
  endOfLocalDayISO,
  startOfLocalDayISO,
  useViewFilters,
} from "../hooks/useViewFilters";

function TodayPage() {
  const dueFrom = startOfLocalDayISO();
  const dueTo = endOfLocalDayISO();

  useViewFilters({ dueFrom, dueTo });

  return (
    <TaskBoard
      eyebrow="Focus"
      title="Today"
      subtitle="Tasks scheduled for today."
      emptyText="No tasks due today."
    />
  );
}

export default TodayPage;
