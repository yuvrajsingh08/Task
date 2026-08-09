const normalizeEmail = (value = "") => {
  return String(value).trim().toLowerCase();
};

const isValidEmail = (value = "") => {
  const normalized = normalizeEmail(value);
  if (!normalized) {
    return false;
  }

  const emailPattern =
    /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i;
  return (
    emailPattern.test(normalized) &&
    !normalized.startsWith(".") &&
    !normalized.endsWith(".")
  );
};

const normalizeCategory = (value = "") => {
  if (typeof value !== "string") {
    return "General";
  }

  const normalized = value.trim();
  if (!normalized) {
    return "General";
  }

  return normalized
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
};

const isFutureDateTime = (value) => {
  if (!value) {
    return true;
  }

  const target = new Date(value);

  if (Number.isNaN(target.getTime())) {
    return false;
  }

  return target.getTime() > Date.now();
};

module.exports = {
  normalizeEmail,
  isValidEmail,
  normalizeCategory,
  isFutureDateTime,
};
