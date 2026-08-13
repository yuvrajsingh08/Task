import {
  Bot,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock3,
  Folder,
  LayoutDashboard,
  ListTodo,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useTasks } from "../../context/TaskContext";
import ProfileCard from "./ProfileCard";

const CATEGORIES = [
  { name: "Work", color: "bg-violet-500" },
  { name: "Personal", color: "bg-blue-500" },
  { name: "Development", color: "bg-cyan-500" },
  { name: "Study", color: "bg-orange-500" },
];

function Sidebar() {
  const { aiSummary } = useTasks();
  const [categoriesOpen, setCategoriesOpen] = useState(true);

  const navigation = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      to: "/dashboard",
    },
    {
      label: "My Tasks",
      icon: ListTodo,
      to: "/tasks",
    },
    {
      label: "Today",
      icon: CalendarDays,
      to: "/today",
    },
    {
      label: "Upcoming",
      icon: Clock3,
      to: "/upcoming",
    },
  ];

  const secondaryNavigation = [
    {
      label: "Completed",
      icon: CheckCircle2,
      to: "/completed",
    },
  ];

  const navigationButton = (item) => {
    const Icon = item.icon;

    return (
      <NavLink
        key={item.to}
        to={item.to}
        className={({ isActive }) =>
          `group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
            isActive
              ? "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          }`
        }
      >
        {({ isActive }) => (
          <>
            <Icon
              size={19}
              className={`shrink-0 ${
                isActive
                  ? "text-orange-500"
                  : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"
              }`}
            />

            <span>{item.label}</span>
          </>
        )}
      </NavLink>
    );
  };

  return (
    <aside className="w-full border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 lg:fixed lg:left-[max(0px,calc((100vw-80rem)/2))] lg:top-0 lg:z-30 lg:h-screen lg:w-72 lg:overflow-y-auto lg:border-b-0 lg:border-r xl:w-80">
      <div className="p-3 sm:p-4 lg:p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 text-white shadow-lg shadow-orange-200/50 dark:shadow-orange-950/30">
            <ClipboardList size={23} />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-xl font-black tracking-tight text-slate-950 dark:text-white">
              TaskNest
            </h1>

            <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
              Organize your day
            </p>
          </div>
        </div>

        <nav className="mt-6">
          <p className="mb-2 px-3 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
            Main
          </p>

          <div className="space-y-1">
            {navigation.map(navigationButton)}
          </div>
        </nav>

        <div className="my-4 border-t border-slate-100 dark:border-slate-800" />

        <section>
          <p className="mb-2 px-3 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
            Organize
          </p>

          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setCategoriesOpen((value) => !value)}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <span className="flex items-center gap-3">
                <Folder size={19} className="text-slate-400" />
                Categories
              </span>

              {categoriesOpen ? (
                <ChevronDown size={17} className="text-slate-400" />
              ) : (
                <ChevronRight size={17} className="text-slate-400" />
              )}
            </button>

            {categoriesOpen && (
              <div className="ml-3 space-y-1 border-l border-slate-200 pl-3 dark:border-slate-700">
                {CATEGORIES.map((category) => (
                  <NavLink
                    key={category.name}
                    to={`/categories/${category.name.toLowerCase()}`}
                    className={({ isActive }) =>
                      `flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                        isActive
                          ? "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300"
                          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                      }`
                    }
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${category.color}`}
                    />

                    {category.name}
                  </NavLink>
                ))}
              </div>
            )}

            {secondaryNavigation.map(navigationButton)}
          </div>
        </section>

        <div className="my-4 border-t border-slate-100 dark:border-slate-800" />

        <section>
          <NavLink
            to="/ai"
            className={({ isActive }) =>
              `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Sparkles
                  size={19}
                  className={
                    isActive ? "text-orange-500" : "text-slate-400"
                  }
                />

                AI Assistant
              </>
            )}
          </NavLink>

          <div className="mt-2 rounded-2xl border border-orange-100 bg-orange-50/70 p-3 dark:border-orange-500/10 dark:bg-orange-500/10">
            <div className="flex items-center gap-2">
              <Bot size={16} className="text-orange-500" />

              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Smart Summary
              </span>
            </div>

            <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-600 dark:text-slate-400">
              {aiSummary?.summary || "Add tasks to get a smart summary."}
            </p>
          </div>
        </section>

        <div className="mt-4">
          <ProfileCard />
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;