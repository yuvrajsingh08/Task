import AppLayout from "../components/layout/AppLayout";
import OverviewCards from "../components/layout/OverviewCards";
import TaskFilters from "../components/tasks/TaskFilters";
import TaskForm from "../components/tasks/TaskForm";
import TaskList from "../components/tasks/TaskList";
import Topbar from "../components/layout/Topbar";
import { useTasks } from "../context/TaskContext";

function Dashboard() {
  const { message } = useTasks();

  return (
    <AppLayout>
      <Topbar />
      <OverviewCards />
      <TaskForm />
      <TaskFilters />
      {message && (
        <p className="mb-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
          {message}
        </p>
      )}
      <TaskList />
    </AppLayout>
  );
}

export default Dashboard;
