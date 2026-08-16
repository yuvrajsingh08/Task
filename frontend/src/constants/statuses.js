export const TASK_STATUSES = ["Todo", "In Progress", "Pending", "Completed"];

export const STATUS_FILTER_OPTIONS = ["All", ...TASK_STATUSES];

export const getNextTaskStatus = (status) => {
  const currentIndex = TASK_STATUSES.indexOf(status);

  if (currentIndex === -1) {
    return TASK_STATUSES[0];
  }

  return TASK_STATUSES[(currentIndex + 1) % TASK_STATUSES.length];
};
