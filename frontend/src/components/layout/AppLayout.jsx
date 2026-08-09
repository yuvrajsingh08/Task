import Sidebar from "./Sidebar";

function AppLayout({ children }) {
  return (
    <main className="app-shell">
      <Sidebar />
      <section className="content">{children}</section>
    </main>
  );
}

export default AppLayout;
