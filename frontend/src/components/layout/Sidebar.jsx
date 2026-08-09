import { Bot, ClipboardList, Flag, LayoutDashboard } from "lucide-react";
import { useTasks } from "../../context/TaskContext";
import ProfileCard from "./ProfileCard";
import StatCard from "../ui/StatCard";

function Sidebar() {
  const { aiSummary, stats } = useTasks();
  const suggestions = aiSummary?.suggestions || [
    "Your smart suggestions will appear here.",
  ];

  return (
    <aside className="w-full border-b border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:p-4 lg:fixed lg:left-[max(0px,calc((100vw-80rem)/2))] lg:top-0 lg:z-30 lg:h-screen lg:w-72 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:p-5 xl:w-80">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-gradient-to-br from-pink-500 to-violet-500 p-2.5 text-white shadow-lg shadow-pink-200 dark:shadow-pink-950/30">
          <ClipboardList size={24} />
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tight">TaskFlow</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Plan your day softly
          </p>
        </div>
      </div>

      <nav className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-1">
        <a
          className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white shadow lg:justify-start dark:bg-slate-100 dark:text-slate-900"
          href="#tasks">
          <LayoutDashboard size={18} />
          Board
        </a>
        <a
          className="flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 lg:justify-start dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          href="#priority">
          <Flag size={18} />
          Priority
        </a>
      </nav>

      <ProfileCard />

      <div className="mt-3 grid grid-cols-3 gap-2">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Pending" value={stats.pending} />
        <StatCard label="Done" value={stats.completed} />
      </div>

      <section className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-800/40">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          <Bot size={18} />
          <h2>AI Assistant</h2>
        </div>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
          {aiSummary?.summary || "Add tasks to get a smart summary."}
        </p>
        <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
          {suggestions.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-pink-400" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}

export default Sidebar;
