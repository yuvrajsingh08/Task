const test = require("node:test");
const assert = require("node:assert/strict");
const {
  normalizeEmail,
  isValidEmail,
  normalizeCategory,
  isFutureDateTime,
} = require("../src/utils/validation");

test("normalizeEmail trims and lowercases addresses", () => {
  assert.equal(normalizeEmail("  User@Example.COM  "), "user@example.com");
});

test("isValidEmail rejects malformed addresses", () => {
  assert.equal(isValidEmail("user@"), false);
  assert.equal(isValidEmail("user@example"), false);
  assert.equal(isValidEmail("user@example.com"), true);
  assert.equal(isValidEmail("user.name+tag@example.co.uk"), true);
});

test("normalizeCategory standardizes casing and spacing", () => {
  assert.equal(normalizeCategory("personal tasks"), "Personal Tasks");
  assert.equal(normalizeCategory(" work  "), "Work");
  assert.equal(normalizeCategory(""), "General");
});

test("isFutureDateTime rejects past values", () => {
  assert.equal(isFutureDateTime(new Date(Date.now() - 1000)), false);
  assert.equal(isFutureDateTime(new Date(Date.now() + 1000)), true);
  assert.equal(isFutureDateTime(""), true);
});
