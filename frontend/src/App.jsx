import Dashboard from "./pages/Dashboard";
import AuthPage from "./pages/AuthPage";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { TaskProvider } from "./context/TaskContext";

function AppContent() {
  const { user } = useAuth();

  if (!user) {
    return <AuthPage />;
  }

  return (
    <TaskProvider>
      <Dashboard />
    </TaskProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
