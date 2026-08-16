const CATEGORY_COLORS = [
  "bg-orange-500",
  "bg-amber-500",
  "bg-yellow-500",
  "bg-orange-400",
  "bg-amber-400",
  "bg-orange-600",
  "bg-yellow-600",
  "bg-amber-600",
];

export const getCategoryColor = (name = "") => {
  const value = String(name);
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = value.charCodeAt(index) + ((hash << 5) - hash);
  }

  return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length];
};

export const categoryToSlug = (name = "") => encodeURIComponent(name);

export const slugToCategory = (slug = "") => {
  try {
    return decodeURIComponent(slug).trim();
  } catch (error) {
    return String(slug).trim();
  }
};
