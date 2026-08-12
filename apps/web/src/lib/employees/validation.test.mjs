import assert from "node:assert/strict";
import test from "node:test";

import { validateEmployeeFormData } from "./validation.ts";

function validEmployeeForm(overrides = {}) {
  const values = {
    fullName: "  Mary   Jane  ",
    employeeCode: " emp_001 ",
    employmentType: "full_time",
    minimumDesiredHours: "0",
    targetHours: "38",
    maximumDesiredHours: "40",
    maximumAllowedHours: "45",
    overtimePreference: "neutral",
    notes: "Operational note",
    ...overrides,
  };
  const formData = new FormData();

  for (const [name, value] of Object.entries(values)) {
    formData.set(name, value);
  }

  return formData;
}

test("valid employee input is normalized by the production validator", () => {
  const result = validateEmployeeFormData(validEmployeeForm());

  assert.equal(result.success, true);

  if (result.success) {
    assert.equal(result.data.fullName, "Mary Jane");
    assert.equal(result.data.employeeCode, "EMP_001");
  }
});

test("employee code validation preserves approved underscores", () => {
  const result = validateEmployeeFormData(
    validEmployeeForm({ employeeCode: "STAFF_MEMBER" }),
  );

  assert.equal(result.success, true);
});

test("invalid employee codes and enum values return field errors", () => {
  const result = validateEmployeeFormData(
    validEmployeeForm({
      employeeCode: "BAD CODE",
      employmentType: "employee",
      overtimePreference: "sometimes",
    }),
  );

  assert.equal(result.success, false);

  if (!result.success) {
    assert.ok(result.fieldErrors.employeeCode);
    assert.ok(result.fieldErrors.employmentType);
    assert.ok(result.fieldErrors.overtimePreference);
  }
});

test("hours must be non-negative quarter-hours in approved order", () => {
  const result = validateEmployeeFormData(
    validEmployeeForm({
      minimumDesiredHours: "-0.25",
      targetHours: "38.1",
      maximumDesiredHours: "30",
      maximumAllowedHours: "20",
    }),
  );

  assert.equal(result.success, false);

  if (!result.success) {
    assert.ok(result.fieldErrors.minimumDesiredHours);
    assert.ok(result.fieldErrors.targetHours);
    assert.ok(result.fieldErrors.maximumAllowedHours);
  }
});

test("maximum allowed hours cannot exceed 168", () => {
  const result = validateEmployeeFormData(
    validEmployeeForm({
      maximumDesiredHours: "168",
      maximumAllowedHours: "168.25",
    }),
  );

  assert.equal(result.success, false);

  if (!result.success) {
    assert.match(result.fieldErrors.maximumAllowedHours ?? "", /168/);
  }
});

test("notes longer than 2,000 characters are rejected", () => {
  const result = validateEmployeeFormData(
    validEmployeeForm({ notes: "n".repeat(2001) }),
  );

  assert.equal(result.success, false);

  if (!result.success) {
    assert.ok(result.fieldErrors.notes);
  }
});

test("character limits count Unicode characters like PostgreSQL", () => {
  const result = validateEmployeeFormData(
    validEmployeeForm({ notes: "🙂".repeat(2000) }),
  );

  assert.equal(result.success, true);
});
