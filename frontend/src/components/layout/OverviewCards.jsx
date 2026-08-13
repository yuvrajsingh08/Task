import { Activity, CheckCircle2, Clock, Flag } from "lucide-react";
import { useTasks } from "../../context/TaskContext";

function OverviewCards() {
  const { stats } = useTasks();

  const completion = stats.total
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  const cards = [
    {
      label: "Total",
      value: stats.total,
      icon: <Activity size={15} />,
      tone: "from-sky-500 to-cyan-500",
      surface: "bg-[#d9f4ff]",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: <Clock size={15} />,
      tone: "from-amber-500 to-orange-500",
      surface: "bg-[#ffe3d6]",
    },
    {
      label: "Done",
      value: stats.completed,
      icon: <CheckCircle2 size={15} />,
      tone: "from-emerald-500 to-lime-500",
      surface: "bg-[#fff1a8]",
    },
    {
      label: "High",
      value: stats.highPriority,
      icon: <Flag size={15} />,
      tone: "from-rose-500 to-pink-500",
      surface: "bg-[#ffd8ea]",
    },
    {
      label: "Done %",
      value: `${completion}%`,
      icon: <CheckCircle2 size={15} />,
      tone: "from-violet-500 to-fuchsia-500",
      surface: "bg-[#eadcff]",
    },
  ];

  return (
    <section className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => (
        <article
          key={card.label}
          className={`relative flex items-center gap-2.5 overflow-hidden rounded-lg border border-white/70 ${card.surface} px-2.5 py-3 dark:border-slate-800 dark:bg-slate-900 sm:px-3 sm:py-3.5`}
        >
          <div
            className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${card.tone} text-white`}
          >
            {card.icon}
          </div>

          <div className="relative min-w-0">
            <p className="truncate text-[10px] font-semibold text-slate-600 dark:text-slate-400">
              {card.label}
            </p>

            <p className="truncate text-base font-bold leading-tight text-slate-950 dark:text-white sm:text-lg">
              {card.value}
            </p>
          </div>
        </article>
      ))}
    </section>
  );
}

export default OverviewCards;