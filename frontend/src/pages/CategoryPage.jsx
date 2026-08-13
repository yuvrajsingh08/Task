import { Navigate, useParams } from "react-router-dom";
import TaskBoard from "../components/tasks/TaskBoard";
import { slugToCategory } from "../constants/categories";
import { useViewFilters } from "../hooks/useViewFilters";

function CategoryPage() {
  const { category } = useParams();
  const name = slugToCategory(category);

  useViewFilters({
    category: name || "All",
  });

  if (!name) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <TaskBoard
      eyebrow="Category"
      title={name}
      subtitle={`Tasks in the ${name} category.`}
      hideCategoryFilter
      emptyText={`No ${name} tasks found.`}
    />
  );
}

export default CategoryPage;
