import Sidebar from "./Sidebar";

function AppLayout({ children }) {
  return (
    <main className="min-h-screen bg-[#fff1eb] text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto min-h-screen w-full max-w-7xl">
        <Sidebar />
        <section className="min-w-0 px-3 py-3 sm:px-5 sm:py-4 lg:ml-72 lg:px-5 lg:py-5 xl:ml-80 xl:px-6">
          {children}
        </section>
      </div>
    </main>
  );
}

export default AppLayout;
