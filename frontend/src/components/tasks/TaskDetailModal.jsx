import * as Dialog from "@radix-ui/react-dialog";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Circle,
  Flag,
  Folder,
  Mail,
  X,
} from "lucide-react";
import SelectField from "../ui/SelectField";
import { useTasks } from "../../context/TaskContext";

const PRIORITY_DOT = {
  High: "text-rose-500",
  Medium: "text-amber-500",
  Low: "text-emerald-500",
};

function InfoChip({ icon, label, tone }) {
  return (
    <div
      className={`flex min-w-0 items-center gap-2 rounded-lg px-3 py-2.5 text-sm ${
        tone || "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
      }`}
    >
      {icon}
      <span className="truncate">{label}</span>
    </div>
  );
}

function TaskDetailModal({ onClose, task }) {
  const { tasks, updateTaskField } = useTasks();

  if (!task) {
    return null;
  }

  const activeTask = tasks.find((item) => item._id === task._id) || task;
  const isCompleted = activeTask.status === "Completed";
  const dueDate = activeTask.dueDate
    ? new Date(activeTask.dueDate).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "No due date";
  const reminderDate = activeTask.reminderAt
    ? new Date(activeTask.reminderAt).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "No reminder";

  return (
    <Dialog.Root
      open={Boolean(task)}
      onOpenChange={(open) => !open && onClose()}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[min(94vw,560px)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          {/* header */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-4 dark:border-slate-800 sm:p-6">
            <div className="min-w-0">
              <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                {isCompleted ? (
                  <CheckCircle2 size={14} className="text-emerald-500" />
                ) : (
                  <Circle size={14} />
                )}
                {activeTask.status}
              </div>
              <Dialog.Title
                className={`break-words text-xl font-black leading-tight ${
                  isCompleted
                    ? "text-slate-500 line-through dark:text-slate-500"
                    : "text-slate-900 dark:text-white"
                }`}
              >
                {activeTask.title}
              </Dialog.Title>
            </div>
            <Dialog.Close className="shrink-0 rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
              <X size={18} />
            </Dialog.Close>
          </div>

          {/* body */}
          <div className="overflow-y-auto p-4 sm:p-6">
            <Dialog.Description className="break-words text-sm leading-6 text-slate-600 dark:text-slate-400">
              {activeTask.description || "No description added."}
            </Dialog.Description>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <InfoChip
                icon={<Folder size={17} />}
                label={activeTask.category || "General"}
              />
              <InfoChip
                icon={<CalendarDays size={17} />}
                label={dueDate}
              />
              <InfoChip
                icon={
                  <Flag
                    size={17}
                    className={`fill-current ${PRIORITY_DOT[activeTask.priority] || ""}`}
                  />
                }
                label={`${activeTask.priority} priority`}
              />
              <InfoChip
                icon={
                  isCompleted ? (
                    <CheckCircle2 size={17} className="text-emerald-500" />
                  ) : (
                    <Circle size={17} />
                  )
                }
                label={activeTask.status}
              />
              <InfoChip
                icon={<Bell size={17} className="text-orange-500" />}
                label={reminderDate}
                tone="bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300"
              />
              <InfoChip
                icon={<Mail size={17} className="text-sky-500" />}
                label={
                  activeTask.reminderEmailEnabled
                    ? `Email ${activeTask.reminderEmailStatus || "pending"}`
                    : "Email off"
                }
                tone="bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300"
              />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <SelectField
                label="Status"
                value={activeTask.status}
                onChange={(value) =>
                  updateTaskField(activeTask._id, "status", value)
                }
                options={["Pending", "Completed"]}
              />
              <SelectField
                label="Priority"
                value={activeTask.priority}
                onChange={(value) =>
                  updateTaskField(activeTask._id, "priority", value)
                }
                options={["Low", "Medium", "High"]}
              />
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default TaskDetailModal;
