import { Bot, Lightbulb, RefreshCw, Sparkles } from "lucide-react";
import TaskForm from "../components/tasks/TaskForm";
import Topbar from "../components/layout/Topbar";
import { useTasks } from "../context/TaskContext";

function AiAssistantPage() {
  const { aiSummary, fetchAiSummary } = useTasks();

  const suggestions = Array.isArray(aiSummary?.suggestions)
    ? aiSummary.suggestions
    : [];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0">
        <Topbar
          eyebrow="Assistant"
          title="AI Assistant"
          subtitle="A smart summary and suggestions based on your current tasks."
        />
        <TaskForm />
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain">
        <section className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm shadow-orange-100/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 text-white">
                <Sparkles size={20} />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-black text-slate-950 dark:text-white">
                  Smart Summary
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Generated from your task board
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={fetchAiSummary}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-orange-500 dark:hover:bg-orange-500/10 dark:hover:text-orange-400"
            >
              <RefreshCw size={15} />
              Refresh
            </button>
          </div>

          <div className="mt-4 flex gap-3 rounded-2xl border border-orange-100 bg-orange-50/70 p-4 dark:border-orange-500/10 dark:bg-orange-500/10">
            <Bot size={18} className="mt-0.5 shrink-0 text-orange-500" />
            <p className="text-sm leading-6 text-slate-700 dark:text-slate-300">
              {aiSummary?.summary || "Add tasks to get a smart summary."}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm shadow-orange-100/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none sm:p-5">
          <div className="mb-3 flex items-center gap-2">
            <Lightbulb size={18} className="text-orange-500" />
            <h3 className="text-lg font-black text-slate-950 dark:text-white">
              Suggestions
            </h3>
          </div>

          {suggestions.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No suggestions yet. Add a few tasks to get started.
            </p>
          ) : (
            <ul className="space-y-2">
              {suggestions.map((suggestion) => (
                <li
                  key={suggestion}
                  className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-200"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default AiAssistantPage;
