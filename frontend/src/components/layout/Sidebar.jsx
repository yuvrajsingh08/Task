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
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { categoryToSlug, getCategoryColor } from "../../constants/categories";
import { useTasks } from "../../context/TaskContext";
import ProfileCard from "./ProfileCard";

function Sidebar({ isOpen = false, onClose = () => {} }) {
  const { aiSummary, categories } = useTasks();
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
        onClick={onClose}
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
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-[min(100vw-3rem,18rem)] flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-out dark:border-slate-800 dark:bg-slate-950 sm:w-72 xl:w-80 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:left-[max(0px,calc((100vw-80rem)/2))] lg:translate-x-0`}
    >
      <div className="flex shrink-0 items-center justify-between p-3 sm:p-4 lg:p-5 lg:pb-3">
        <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <img
            src="/assets/logo.png"
            alt="Stack"
            className="h-7 w-7 object-contain"
          />
        </div>

        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold tracking-tight text-slate-950 dark:text-white">
            Stack
          </h1>

          <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
            Organize your work
          </p>
        </div>
      </div>

        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 lg:hidden dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <X size={18} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-3 sm:px-4 lg:px-5 lg:pb-4">
        <nav className="mt-1">
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
                {categories.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-slate-400">
                    Categories appear when you add tasks.
                  </p>
                ) : (
                  categories.map((category) => (
                    <NavLink
                      key={category.name}
                      to={`/categories/${categoryToSlug(category.name)}`}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                          isActive
                            ? "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300"
                            : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                        }`
                      }
                    >
                      <span
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${getCategoryColor(category.name)}`}
                      />

                      <span className="min-w-0 flex-1 truncate">
                        {category.name}
                      </span>

                      <span className="text-[11px] font-semibold text-slate-400">
                        {category.count}
                      </span>
                    </NavLink>
                  ))
                )}
              </div>
            )}

            {secondaryNavigation.map(navigationButton)}
          </div>
        </section>

        <div className="my-4 border-t border-slate-100 dark:border-slate-800" />

        <section>
          <NavLink
            to="/ai"
            onClick={onClose}
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
      </div>

      <div className="shrink-0 border-t border-slate-100 p-3 sm:p-4 lg:p-5 lg:pt-3 dark:border-slate-800">
        <ProfileCard />
      </div>
    </aside>
  );
}

export default Sidebar;
