import { CalendarDays, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTasks } from "../../context/TaskContext";

function Topbar() {
  const { stats } = useTasks();
  const { logout, user } = useAuth();

  return (
    <div className="topbar">
      <div>
        <span className="eyebrow">Project board</span>
        <h2>Project Tasks</h2>
        <p>Plan, track, and finish your daily work, {user?.name}.</p>
      </div>
      <div className="topbar-actions">
        <span className="status-pill">{stats.pending} pending</span>
        <span className="date-pill">
          <CalendarDays size={16} />
          Today
        </span>
        <button className="logout-btn" type="button" onClick={logout} title="Logout">
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </div>
  );
}

export default Topbar;
