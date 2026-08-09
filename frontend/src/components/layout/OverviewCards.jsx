import { FiActivity, FiCheckCircle, FiClock, FiFlag } from "react-icons/fi";
import { useTasks } from "../../context/TaskContext";

function OverviewCards() {
  const { stats } = useTasks();
  const completion = stats.total
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  const cards = [
    {
      label: "Total Tasks",
      value: stats.total,
      icon: <FiActivity />,
      tone: "from-sky-500 to-cyan-500",
      surface: "bg-[#d9f4ff]",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: <FiClock />,
      tone: "from-amber-500 to-orange-500",
      surface: "bg-[#ffe3d6]",
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: <FiCheckCircle />,
      tone: "from-emerald-500 to-lime-500",
      surface: "bg-[#fff1a8]",
    },
    {
      label: "High Priority",
      value: stats.highPriority,
      icon: <FiFlag />,
      tone: "from-rose-500 to-pink-500",
      surface: "bg-[#ffd8ea]",
    },
    {
      label: "Completion",
      value: `${completion}%`,
      icon: <FiCheckCircle />,
      tone: "from-violet-500 to-fuchsia-500",
      surface: "bg-[#eadcff]",
    },
  ];

  return (
    <section className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <article
          key={card.label}
          className={`relative overflow-hidden rounded-2xl border border-white/70 ${card.surface} p-3 shadow-sm shadow-orange-100/60 dark:border-slate-800 dark:bg-none dark:bg-slate-900 dark:shadow-none sm:p-4`}>
          <span className="absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/30" />
          <div
            className={`relative mb-2 inline-flex rounded-xl bg-gradient-to-br ${card.tone} p-2.5 text-white shadow-sm`}>
            {card.icon}
          </div>
          <p className="relative text-sm font-bold text-slate-600 dark:text-slate-400">
            {card.label}
          </p>
          <p className="relative mt-1 text-3xl font-black text-slate-950 dark:text-white">
            {card.value}
          </p>
        </article>
      ))}
    </section>
  );
}

export default OverviewCards;
