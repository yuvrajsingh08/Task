import Dashboard from "./pages/Dashboard";
import { TaskProvider } from "./context/TaskContext";

function App() {
  return (
    <TaskProvider>
      <Dashboard />
    </TaskProvider>
  );
}

export default App;
