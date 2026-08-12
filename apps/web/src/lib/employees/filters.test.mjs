import assert from "node:assert/strict";
import test from "node:test";

import {
  employeeSearchPattern,
  employeeStatusValue,
  mergeEmployeeSearchResults,
  normaliseEmployeeListFilters,
} from "./filters.ts";

test("empty search uses no ilike pattern", () => {
  const filters = normaliseEmployeeListFilters({ q: "   " });

  assert.equal(filters.search, "");
  assert.equal(employeeSearchPattern(filters.search), null);
});

test("percent and underscore are escaped as literal LIKE characters", () => {
  assert.equal(employeeSearchPattern("50%"), "%50\\%%");
  assert.equal(employeeSearchPattern("EMP_001"), "%EMP\\_001%");
});

test("search is normalized and bounded without removing underscores", () => {
  const filters = normaliseEmployeeListFilters({
    q: `  EMP_001   ${"x".repeat(120)}  `,
  });

  assert.equal(filters.search.startsWith("EMP_001 "), true);
  assert.equal(filters.search.length, 100);
});

test("status filtering defaults safely and maps approved values", () => {
  assert.deepEqual(normaliseEmployeeListFilters({}), {
    search: "",
    status: "active",
  });
  assert.equal(employeeStatusValue("active"), true);
  assert.equal(employeeStatusValue("inactive"), false);
  assert.equal(employeeStatusValue("all"), undefined);
  assert.equal(
    normaliseEmployeeListFilters({ status: "unexpected" }).status,
    "active",
  );
});

test("duplicate name and code matches are deduplicated and sorted by name", () => {
  const alex = { id: "2", full_name: "Alex Stone" };
  const bailey = { id: "1", full_name: "Bailey Jones" };

  assert.deepEqual(
    mergeEmployeeSearchResults([bailey, alex], [alex]),
    [alex, bailey],
  );
});
