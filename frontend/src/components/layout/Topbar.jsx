import { CalendarDays, LogOut, Moon, Plus, Sun } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTasks } from "../../context/TaskContext";
import { useTheme } from "../../context/ThemeContext";

function Topbar() {
  const { openTaskModal, stats } = useTasks();
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-orange-100 bg-white p-3 shadow-sm shadow-orange-100/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none sm:p-4 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0">
        <p className="mb-1 text-xs font-black uppercase text-slate-500 dark:text-slate-400">
          Project board
        </p>
        <h2 className="text-2xl font-black tracking-tight">
          Project Tasks
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Plan, track, and finish your daily work, {user?.name}.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 md:justify-end">
        <button
          className="flex items-center gap-2 rounded-full bg-[#ffd8c7] px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-[#ffc8b0] dark:bg-orange-200 dark:hover:bg-orange-100"
          type="button"
          onClick={openTaskModal}>
          <Plus size={17} />
          Add New Task
        </button>
        <span className="rounded-lg bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
          {stats.pending} pending
        </span>
        <span className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <CalendarDays size={16} />
          Today
        </span>
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          title="Toggle theme">
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <button
          className="flex items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          type="button"
          onClick={logout}
          title="Logout">
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </div>
  );
}

export default Topbar;
