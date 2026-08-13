const CATEGORY_COLORS = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-cyan-500",
  "bg-orange-500",
  "bg-emerald-500",
  "bg-pink-500",
  "bg-amber-500",
  "bg-rose-500",
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
