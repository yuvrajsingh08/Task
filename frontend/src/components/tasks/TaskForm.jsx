import { Plus, X } from "lucide-react";
import { useTasks } from "../../context/TaskContext";

function TaskForm() {
  const { editingId, form, resetForm, saveTask, updateForm } = useTasks();

  return (
    <form className="task-form" onSubmit={saveTask}>
      <div className="form-header">
        <div>
          <span className="eyebrow">{editingId ? "Update issue" : "Create issue"}</span>
          <h3>{editingId ? "Edit Task" : "Add New Task"}</h3>
        </div>
        <button type="submit" className="primary-btn">
          <Plus size={18} />
          {editingId ? "Update" : "Add"}
        </button>
      </div>

      <div className="form-grid">
        <input name="title" value={form.title} onChange={updateForm} placeholder="Task title" />
        <input name="category" value={form.category} onChange={updateForm} placeholder="Category" />
        <select name="priority" value={form.priority} onChange={updateForm}>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <input name="dueDate" type="date" value={form.dueDate} onChange={updateForm} />
      </div>

      <textarea
        name="description"
        value={form.description}
        onChange={updateForm}
        placeholder="Description"
      />

      {editingId && (
        <button type="button" className="ghost-btn" onClick={resetForm}>
          <X size={16} />
          Cancel edit
        </button>
      )}
    </form>
  );
}

export default TaskForm;
