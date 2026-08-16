import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  CheckCircle2,
  MoreHorizontal,
  Pencil,
  Repeat2,
  Star,
  Trash2,
} from "lucide-react";
import { getNextTaskStatus } from "../../constants/statuses";

function TaskActionMenu({ onDelete, onEdit, onPin, onToggle, pinned, status }) {
  const nextStatus = getNextTaskStatus(status);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
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
            {nextStatus === "Completed" ? (
              <CheckCircle2 size={16} />
            ) : (
              <Repeat2 size={16} />
            )}
            Move to {nextStatus}
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 outline-none hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            onClick={onPin}>
            <Star size={16} className={pinned ? "fill-current text-amber-500" : ""} />
            {pinned ? "Unpin Task" : "Pin Task"}
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
