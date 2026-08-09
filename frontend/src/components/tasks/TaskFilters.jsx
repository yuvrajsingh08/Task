import { Search } from "lucide-react";
import { useTasks } from "../../context/TaskContext";

function TaskFilters() {
  const {
    priorityFilter,
    search,
    setPriorityFilter,
    setSearch,
    setStatusFilter,
    statusFilter
  } = useTasks();

  return (
    <div className="filters" id="tasks">
      <label className="search-box">
        <Search size={18} />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search task, category, description"
        />
      </label>
      <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
        <option>All</option>
        <option>Pending</option>
        <option>Completed</option>
      </select>
      <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}>
        <option>All</option>
        <option>Low</option>
        <option>Medium</option>
        <option>High</option>
      </select>
    </div>
  );
}

export default TaskFilters;
