import { CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { useTasks } from "../../context/TaskContext";

function TaskCard({ task }) {
  const { deleteTask, startEdit, toggleTaskStatus } = useTasks();
  const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date";

  return (
    <article className={`task-card ${task.status === "Completed" ? "done" : ""}`}>
      <div className="task-main">
        <button
          className="check-btn"
          type="button"
          onClick={() => toggleTaskStatus(task._id)}
          title="Toggle status"
        >
          <CheckCircle2 size={22} />
        </button>

        <div className="task-body">
          <div className="task-title-row">
            <h3>{task.title}</h3>
            <span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span>
          </div>
          <p>{task.description || "No description"}</p>
          <div className="meta">
            <span>{task.category || "General"}</span>
            <span>{task.status}</span>
            <span>{dueDate}</span>
          </div>
        </div>
      </div>

      <div className="actions">
        <button type="button" onClick={() => startEdit(task)} title="Edit task">
          <Pencil size={18} />
        </button>
        <button type="button" onClick={() => deleteTask(task._id)} title="Delete task">
          <Trash2 size={18} />
        </button>
      </div>
    </article>
  );
}

export default TaskCard;
