import * as Popover from "@radix-ui/react-popover";
import { CalendarDays, X } from "lucide-react";

function DatePickerField({ label, onChange, value, min }) {
  const formattedValue = value
    ? new Date(`${value}T00:00:00`).toLocaleDateString()
    : "Pick date";

  return (
    <div>
      {label && (
        <span className="mb-2 block text-sm font-semibold text-slate-600 dark:text-slate-300">
          {label}
        </span>
      )}

      <Popover.Root>
        <Popover.Trigger
          className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3.5 py-2.5 text-left text-sm font-medium ${
            value
              ? "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              : "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
          }`}
          type="button"
        >
          <span className="flex items-center gap-2">
            <CalendarDays size={16} />
            {formattedValue}
          </span>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            className="z-50 w-[min(92vw,18rem)] rounded-lg border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900"
            sideOffset={6}
          >
            <input
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-orange-500 dark:focus:ring-orange-500/10"
              type="date"
              value={value}
              min={min}
              onChange={(event) => onChange(event.target.value)}
            />

            {value && (
              <button
                className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-orange-600 dark:text-slate-300 dark:hover:text-orange-400"
                type="button"
                onClick={() => onChange("")}
              >
                <X size={15} />
                Clear date
              </button>
            )}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}

export default DatePickerField;