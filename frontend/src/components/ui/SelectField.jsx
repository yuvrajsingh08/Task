import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

function SelectField({ label, onChange, options, value }) {
  return (
    <div>
      {label && (
        <span className="mb-2 block text-sm font-semibold text-slate-600 dark:text-slate-300">
          {label}
        </span>
      )}
      <Select.Root value={value} onValueChange={onChange}>
        <Select.Trigger
          className="flex min-w-0 w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-left text-sm font-medium text-slate-700 outline-none transition focus:border-pink-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          aria-label={label}>
          <Select.Value />
          <Select.Icon>
            <ChevronDown size={16} />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            className="z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
            position="popper"
            sideOffset={6}>
            <Select.Viewport>
              {options.map((option) => (
                <Select.Item
                  className="flex cursor-pointer items-center justify-between gap-3 px-3 py-2.5 text-sm text-slate-700 outline-none hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  key={option}
                  value={option}>
                  <Select.ItemText>{option}</Select.ItemText>
                  <Select.ItemIndicator>
                    <Check size={15} />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}

export default SelectField;
