import OverviewCards from "../layout/OverviewCards";
import TaskFilters from "../tasks/TaskFilters";
import TaskForm from "../tasks/TaskForm";
import TaskList from "../tasks/TaskList";
import Topbar from "../layout/Topbar";

function TaskBoard({
  eyebrow,
  title,
  subtitle,
  showOverview = false,
  hideStatusFilter = false,
  hideCategoryFilter = false,
  emptyText,
  showAddTask = true,
}) {
  return (
    <>
      <Topbar
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        showAddTask={showAddTask}
      />
      {showOverview && <OverviewCards />}
      <TaskForm />
      <TaskFilters
        hideStatus={hideStatusFilter}
        hideCategory={hideCategoryFilter}
      />
      <TaskList emptyText={emptyText} />
    </>
  );
}

export default TaskBoard;
