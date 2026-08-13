import { LogOut, Moon, Plus, Sun } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTasks } from "../../context/TaskContext";
import { useTheme } from "../../context/ThemeContext";

function Topbar({
  title = "Project Tasks",
  subtitle,
  showAddTask = true,
}) {
  const { openTaskModal, stats } = useTasks();
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="mb-3 flex w-full items-center justify-between gap-4 rounded-xl border border-orange-100 bg-white px-4 py-3 shadow-sm shadow-orange-100/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none sm:px-5 sm:py-3.5">
      {/* Left side */}
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-base font-bold tracking-tight text-slate-950 dark:text-white sm:text-lg">
          {title}
        </h2>

        <p className="mt-1 truncate text-[11px] leading-4 text-slate-500 dark:text-slate-400 sm:text-xs">
          {subtitle || `Plan, track, and finish your daily work, ${user?.name}.`}
        </p>
      </div>

      {/* Right side */}
      <div className="flex shrink-0 items-center gap-2">
      {/* Add Task */}
      {showAddTask && (
        <button
          type="button"
          onClick={openTaskModal}
          className="flex h-8 items-center justify-center gap-1 rounded-lg bg-[#ffd8c7] px-2 text-xs font-semibold text-slate-900 transition hover:bg-[#ffc8b0] dark:bg-orange-200 dark:hover:bg-orange-100 pr-3"
          title="Add Task"
        >
          <Plus size={15} strokeWidth={2} />

          <span className="hidden sm:inline  text-xs font-semibold text-slate-900">Add Task</span>
        </button>
      )}

      {/* Pending */}
      <span className="hidden h-8 items-center justify-center whitespace-nowrap rounded-lg border border-amber-200 bg-amber-50 px-3 text-xs font-semibold text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300 sm:flex">
        {stats.pending} Pending
      </span>

      {/* Theme */}
      <button
        type="button"
        onClick={toggleTheme}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
        title="Toggle theme"
      >
        {theme === "dark" ? (
          <Sun size={15} strokeWidth={2} />
        ) : (
          <Moon size={15} strokeWidth={2} />
        )}
      </button>

      {/* Logout */}
      <button
        type="button"
        onClick={logout}
        className="flex h-8 items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
        title="Logout"
      >
        <LogOut size={15} strokeWidth={2} />

        <span className="hidden sm:inline">Logout</span>
      </button>
    </div>
    </div>
  );
}

export default Topbar;