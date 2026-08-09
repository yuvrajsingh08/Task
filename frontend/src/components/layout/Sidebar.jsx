import { Bot, ClipboardList, Flag, LayoutDashboard } from "lucide-react";
import { useTasks } from "../../context/TaskContext";
import StatCard from "../ui/StatCard";

function Sidebar() {
  const { aiSummary, stats } = useTasks();
  const suggestions = aiSummary?.suggestions || ["Your smart suggestions will appear here."];

  return (
    <aside className="sidebar">
      <div className="brand">
        <ClipboardList size={30} />
        <div>
          <h1>TaskFlow</h1>
          <span>Smart work board</span>
        </div>
      </div>

      <nav className="side-nav">
        <a className="active" href="#tasks">
          <LayoutDashboard size={18} />
          Board
        </a>
        <a href="#priority">
          <Flag size={18} />
          Priority
        </a>
      </nav>

      <div className="stat-list">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Pending" value={stats.pending} />
        <StatCard label="Done" value={stats.completed} />
      </div>

      <section className="ai-box">
        <div className="section-title">
          <Bot size={18} />
          <h2>AI Assistant</h2>
        </div>
        <p>{aiSummary?.summary || "Add tasks to get a smart summary."}</p>
        <ul>
          {suggestions.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </aside>
  );
}

export default Sidebar;
