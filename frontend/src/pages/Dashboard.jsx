import AppLayout from "../components/layout/AppLayout";
import OverviewCards from "../components/layout/OverviewCards";
import TaskFilters from "../components/tasks/TaskFilters";
import TaskForm from "../components/tasks/TaskForm";
import TaskList from "../components/tasks/TaskList";
import Topbar from "../components/layout/Topbar";

function Dashboard() {

  return (
    <AppLayout>
      <Topbar />
      <OverviewCards />
      <TaskForm />
      <TaskFilters />
      <TaskList />
    </AppLayout>
  );
}

export default Dashboard;
