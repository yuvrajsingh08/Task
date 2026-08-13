import * as Dialog from "@radix-ui/react-dialog";
import { Bell, Mail, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTasks } from "../../context/TaskContext";
import DatePickerField from "../ui/DatePickerField";
import SelectField from "../ui/SelectField";

function TaskForm() {
  const {
    closeTaskModal,
    editingId,
    form,
    isSaving,
    isTaskModalOpen,
    resetForm,
    saveTask,
    setFormValue,
    updateForm,
  } = useTasks();

  const [tagsInput, setTagsInput] = useState("");

  useEffect(() => {
    setTagsInput(Array.isArray(form.tags) ? form.tags.join(", ") : form.tags || "");
  }, [form.tags, editingId, isTaskModalOpen]);

  const handleTagsChange = (event) => {
    setTagsInput(event.target.value);
  };

  const handleSubmit = (event) => {
    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    setFormValue("tags", tags);

    saveTask(event);
  };

  return (
    <Dialog.Root
      open={isTaskModalOpen}
      onOpenChange={(open) => !open && closeTaskModal()}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm backdrop-blur-sm" />

        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-[min(94vw,640px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-orange-100 bg-[#fffaf7] p-4 shadow-2xl shadow-orange-200/60 outline-none dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30 sm:p-5">
          <form onSubmit={handleSubmit}>
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase text-orange-500 dark:text-orange-300">
                  {editingId ? "Update task" : "New task"}
                </p>

                <Dialog.Title className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
                  {editingId ? "Edit Task" : "Add New Task"}
                </Dialog.Title>

                <Dialog.Description className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Add the task details, status, priority, tags, and due date.
                </Dialog.Description>
              </div>

              <Dialog.Close
                disabled={isSaving}
                className="shrink-0 rounded-full border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <X size={18} />
              </Dialog.Close>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Title
                </span>

                <input
                  className="w-full rounded-xl border border-orange-100 bg-white px-3.5 py-3 text-slate-900 outline-none ring-0 transition placeholder:text-slate-400 focus:border-orange-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  name="title"
                  value={form.title}
                  onChange={updateForm}
                  placeholder="Task title"
                  disabled={isSaving}
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Category
                </span>

                <input
                  className="w-full rounded-xl border border-orange-100 bg-white px-3.5 py-3 text-slate-900 outline-none ring-0 transition placeholder:text-slate-400 focus:border-orange-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  name="category"
                  value={form.category}
                  onChange={updateForm}
                  placeholder="Category"
                  disabled={isSaving}
                />
              </label>

              <SelectField
                label="Status"
                value={form.status}
                onChange={(value) => setFormValue("status", value)}
                options={["Todo", "Pending", "In Progress", "Completed"]}
              />

              <SelectField
                label="Priority"
                value={form.priority}
                onChange={(value) => setFormValue("priority", value)}
                options={["Low", "Medium", "High"]}
              />

              <label>
                <span className="mb-2 block text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Tags
                </span>

                <input
                  className="w-full rounded-xl border border-orange-100 bg-white px-3.5 py-3 text-slate-900 outline-none ring-0 transition placeholder:text-slate-400 focus:border-orange-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  name="tags"
                  value={tagsInput}
                  onChange={handleTagsChange}
                  placeholder="React, Backend, Urgent"
                  disabled={isSaving}
                />

                <span className="mt-1 block text-xs text-slate-400">
                  Separate tags with commas
                </span>
              </label>

              <DatePickerField
                label="Due Date"
                value={form.dueDate}
                onChange={(value) => setFormValue("dueDate", value)}
              />

              <label>
                <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
                  <Bell size={16} />
                  Reminder
                </span>

                <input
                  className="w-full rounded-xl border border-orange-100 bg-white px-3.5 py-3 text-slate-900 outline-none transition focus:border-orange-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  name="reminderAt"
                  type="datetime-local"
                  value={form.reminderAt}
                  onChange={updateForm}
                  disabled={isSaving}
                />
              </label>
            </div>

            <label className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-2">
                <Mail size={17} className="text-orange-500" />
                Enable email reminder for this task
              </span>

              <input
                checked={Boolean(form.reminderEmailEnabled)}
                className="h-5 w-5 shrink-0 accent-orange-400"
                name="reminderEmailEnabled"
                type="checkbox"
                disabled={isSaving}
                onChange={(event) =>
                  setFormValue("reminderEmailEnabled", event.target.checked)
                }
              />
            </label>

            <label className="mt-3 block">
              <span className="mb-2 block text-sm font-semibold text-slate-600 dark:text-slate-300">
                Description
              </span>

              <textarea
                className="min-h-28 w-full resize-y rounded-xl border border-orange-100 bg-white px-3.5 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                name="description"
                value={form.description}
                onChange={updateForm}
                placeholder="Description"
                disabled={isSaving}
              />
            </label>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              {editingId && (
                <button
                  type="button"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  onClick={resetForm}
                >
                  <X size={16} />
                  Clear edit
                </button>
              )}

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-orange-200 dark:text-slate-950 dark:hover:bg-orange-100"
              >
                <Plus size={18} />

                {isSaving
                  ? editingId
                    ? "Updating..."
                    : "Adding..."
                  : editingId
                    ? "Update Task"
                    : "Add Task"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default TaskForm;