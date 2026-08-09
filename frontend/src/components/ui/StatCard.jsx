function StatCard({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-center dark:border-slate-700 dark:bg-slate-800/70">
      <strong className="block text-base font-black text-slate-900 dark:text-white">
        {value}
      </strong>
      <span className="mt-0.5 block text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">
        {label}
      </span>
    </div>
  );
}

export default StatCard;
