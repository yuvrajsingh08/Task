import OverviewCards from "../layout/OverviewCards";
import TaskFilters from "../tasks/TaskFilters";
import TaskForm from "../tasks/TaskForm";
import { TaskListContent, TaskListPagination } from "../tasks/TaskList";
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
  showTaskList = true,
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0">
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
      </div>

      {showTaskList && (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <TaskListContent emptyText={emptyText} />
          </div>

          <TaskListPagination />
        </>
      )}
    </div>
  );
}

export default TaskBoard;
