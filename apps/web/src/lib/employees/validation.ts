export const EMPLOYMENT_TYPES = [
  "full_time",
  "part_time",
  "casual",
  "contractor",
  "other",
] as const;

export const OVERTIME_PREFERENCES = [
  "likes_overtime",
  "neutral",
  "avoid_overtime",
  "not_allowed",
] as const;

export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];
export type OvertimePreference = (typeof OVERTIME_PREFERENCES)[number];

export type EmployeeFormField =
  | "fullName"
  | "employeeCode"
  | "employmentType"
  | "minimumDesiredHours"
  | "targetHours"
  | "maximumDesiredHours"
  | "maximumAllowedHours"
  | "overtimePreference"
  | "notes";

export type EmployeeFormValues = {
  fullName: string;
  employeeCode: string | null;
  employmentType: EmploymentType;
  minimumDesiredHours: number;
  targetHours: number;
  maximumDesiredHours: number;
  maximumAllowedHours: number;
  overtimePreference: OvertimePreference;
  notes: string | null;
};

export type EmployeeValidationResult =
  | {
      success: true;
      data: EmployeeFormValues;
      fieldErrors: Record<string, never>;
    }
  | {
      success: false;
      fieldErrors: Partial<Record<EmployeeFormField, string>>;
    };

const EMPLOYMENT_TYPE_SET = new Set<string>(EMPLOYMENT_TYPES);
const OVERTIME_PREFERENCE_SET = new Set<string>(OVERTIME_PREFERENCES);
const EMPLOYEE_CODE_PATTERN = /^[A-Z0-9_-]{2,30}$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readString(formData: FormData, name: string) {
  const values = formData.getAll(name);

  if (values.length !== 1 || typeof values[0] !== "string") {
    return "";
  }

  return values[0];
}

function normaliseName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function characterLength(value: string) {
  return Array.from(value).length;
}

function parseHours(
  formData: FormData,
  name: string,
  field: EmployeeFormField,
  label: string,
  fieldErrors: Partial<Record<EmployeeFormField, string>>,
) {
  const rawValue = readString(formData, name).trim();
  const value = Number(rawValue);

  if (!rawValue || !Number.isFinite(value)) {
    fieldErrors[field] = `Enter ${label.toLowerCase()}.`;
    return null;
  }

  if (value < 0) {
    fieldErrors[field] = `${label} cannot be negative.`;
    return null;
  }

  if (!Number.isInteger(value * 4)) {
    fieldErrors[field] = `${label} must use quarter-hour increments.`;
    return null;
  }

  return value;
}

export function validateEmployeeFormData(
  formData: FormData,
): EmployeeValidationResult {
  const fieldErrors: Partial<Record<EmployeeFormField, string>> = {};
  const fullName = normaliseName(readString(formData, "fullName"));
  const rawEmployeeCode = readString(formData, "employeeCode").trim();
  const employeeCode = rawEmployeeCode
    ? rawEmployeeCode.toUpperCase()
    : null;
  const employmentType = readString(formData, "employmentType");
  const overtimePreference = readString(formData, "overtimePreference");
  const rawNotes = readString(formData, "notes");
  const notes = rawNotes.trim() ? rawNotes : null;

  const fullNameLength = characterLength(fullName);

  if (fullNameLength < 2 || fullNameLength > 100) {
    fieldErrors.fullName = "Enter a full name between 2 and 100 characters.";
  }

  if (employeeCode && !EMPLOYEE_CODE_PATTERN.test(employeeCode)) {
    fieldErrors.employeeCode =
      "Use 2 to 30 letters, numbers, hyphens, or underscores.";
  }

  if (!EMPLOYMENT_TYPE_SET.has(employmentType)) {
    fieldErrors.employmentType = "Select an employment type.";
  }

  if (!OVERTIME_PREFERENCE_SET.has(overtimePreference)) {
    fieldErrors.overtimePreference =
      "Select an additional hours preference.";
  }

  if (notes && characterLength(notes) > 2000) {
    fieldErrors.notes = "Notes must be 2,000 characters or fewer.";
  }

  const minimumDesiredHours = parseHours(
    formData,
    "minimumDesiredHours",
    "minimumDesiredHours",
    "Minimum desired hours",
    fieldErrors,
  );
  const targetHours = parseHours(
    formData,
    "targetHours",
    "targetHours",
    "Target hours",
    fieldErrors,
  );
  const maximumDesiredHours = parseHours(
    formData,
    "maximumDesiredHours",
    "maximumDesiredHours",
    "Maximum desired hours",
    fieldErrors,
  );
  const maximumAllowedHours = parseHours(
    formData,
    "maximumAllowedHours",
    "maximumAllowedHours",
    "Maximum allowed hours",
    fieldErrors,
  );

  if (maximumAllowedHours !== null && maximumAllowedHours > 168) {
    fieldErrors.maximumAllowedHours =
      "Maximum allowed hours cannot exceed 168 per week.";
  }

  if (
    minimumDesiredHours !== null &&
    targetHours !== null &&
    minimumDesiredHours > targetHours
  ) {
    fieldErrors.targetHours =
      "Target hours must be at least the minimum desired hours.";
  }

  if (
    targetHours !== null &&
    maximumDesiredHours !== null &&
    targetHours > maximumDesiredHours
  ) {
    fieldErrors.maximumDesiredHours =
      "Maximum desired hours must be at least the target hours.";
  }

  if (
    maximumDesiredHours !== null &&
    maximumAllowedHours !== null &&
    maximumDesiredHours > maximumAllowedHours
  ) {
    fieldErrors.maximumAllowedHours =
      "Maximum allowed hours must be at least the maximum desired hours.";
  }

  if (
    Object.keys(fieldErrors).length > 0 ||
    minimumDesiredHours === null ||
    targetHours === null ||
    maximumDesiredHours === null ||
    maximumAllowedHours === null
  ) {
    return { success: false, fieldErrors };
  }

  return {
    success: true,
    data: {
      fullName,
      employeeCode,
      employmentType: employmentType as EmploymentType,
      minimumDesiredHours,
      targetHours,
      maximumDesiredHours,
      maximumAllowedHours,
      overtimePreference: overtimePreference as OvertimePreference,
      notes,
    },
    fieldErrors: {},
  };
}

export function isEmployeeId(value: string) {
  return UUID_PATTERN.test(value);
}
