import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";

function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const closeSidebar = () => setSidebarOpen(false);

  useEffect(() => {
    closeSidebar();
  }, [location.pathname]);

  return (
    <main className="flex h-dvh overflow-hidden bg-[#fff1eb] text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div className="relative mx-auto flex h-full w-full max-w-7xl overflow-hidden">
        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={closeSidebar}
          />
        )}

        <Sidebar
          isOpen={sidebarOpen}
          onClose={closeSidebar}
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden lg:ml-72 xl:ml-80">
          <header className="flex shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-2 py-1.5 dark:border-slate-800 dark:bg-slate-950 lg:hidden">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setSidebarOpen(true)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <Menu size={18} />
            </button>

            <div className="min-w-0">
              <p className="truncate text-sm font-black tracking-tight text-slate-950 dark:text-white">
                Stack
              </p>
            </div>
          </header>

          <section className="flex min-h-0 flex-1 flex-col overflow-hidden px-2 py-2 sm:px-3 sm:py-2.5 lg:px-4 lg:py-3 xl:px-5">
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}

export default AppLayout;
