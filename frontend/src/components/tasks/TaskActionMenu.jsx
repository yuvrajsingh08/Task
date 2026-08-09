import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  CheckCircle2,
  Circle,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

function TaskActionMenu({ onDelete, onEdit, onToggle, status }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        onClick={(event) => event.stopPropagation()}>
        <MoreHorizontal size={19} />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[180px] rounded-lg border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900"
          sideOffset={8}
          align="end">
          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 outline-none hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={onToggle}>
            {status === "Completed" ? (
              <Circle size={16} />
            ) : (
              <CheckCircle2 size={16} />
            )}
            {status === "Completed" ? "Mark Pending" : "Mark Completed"}
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 outline-none hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={onEdit}>
            <Pencil size={16} />
            Edit Task
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 h-px bg-slate-200 dark:bg-slate-700" />
          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-rose-600 outline-none hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
            onClick={onDelete}>
            <Trash2 size={16} />
            Delete Task
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export default TaskActionMenu;
