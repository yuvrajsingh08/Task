import AppLayout from "../components/layout/AppLayout";
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
      <TaskForm />
      <TaskFilters />
      {message && <p className="message">{message}</p>}
      <TaskList />
    </AppLayout>
  );
}

export default Dashboard;
