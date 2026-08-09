import { CalendarDays } from "lucide-react";
import { useTasks } from "../../context/TaskContext";

function Topbar() {
  const { stats } = useTasks();

  return (
    <div className="topbar">
      <div>
        <span className="eyebrow">Project board</span>
        <h2>Project Tasks</h2>
        <p>Plan, track, and finish your daily work.</p>
      </div>
      <div className="topbar-actions">
        <span className="status-pill">{stats.pending} pending</span>
        <span className="date-pill">
          <CalendarDays size={16} />
          Today
        </span>
      </div>
    </div>
  );
}

export default Topbar;
