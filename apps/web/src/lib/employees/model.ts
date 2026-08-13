import type { Database } from "@/types/database.types";

import type {
  EmploymentType,
  OvertimePreference,
} from "@/lib/employees/validation";

export type MembershipRole =
  Database["public"]["Enums"]["organisation_member_role"];

export type EmployeeListItem = {
  id: string;
  employee_code: string | null;
  full_name: string;
  employment_type: EmploymentType;
  default_target_hours: number;
  default_maximum_allowed_hours: number;
  default_overtime_preference: OvertimePreference;
  active: boolean;
};

export type EmployeeEditItem = {
  id: string;
  employeeCode: string | null;
  fullName: string;
  employmentType: EmploymentType;
  minimumDesiredHours: number;
  targetHours: number;
  maximumDesiredHours: number;
  maximumAllowedHours: number;
  overtimePreference: OvertimePreference;
  notes: string | null;
  active: boolean;
};

export const NEW_EMPLOYEE_VALUES: Omit<EmployeeEditItem, "active" | "id"> = {
  employeeCode: null,
  fullName: "",
  employmentType: "full_time",
  minimumDesiredHours: 0,
  targetHours: 38,
  maximumDesiredHours: 38,
  maximumAllowedHours: 38,
  overtimePreference: "neutral",
  notes: null,
};

const MANAGEMENT_ROLES = new Set<MembershipRole>([
  "owner",
  "admin",
  "manager",
]);

export function canManageEmployees(role: MembershipRole) {
  return MANAGEMENT_ROLES.has(role);
}

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  full_time: "Full time",
  part_time: "Part time",
  casual: "Casual",
  contractor: "Contractor",
  other: "Other",
};

export const OVERTIME_PREFERENCE_LABELS: Record<
  OvertimePreference,
  string
> = {
  likes_overtime: "Open to additional hours",
  neutral: "Neutral",
  avoid_overtime: "Prefer to avoid additional hours",
  not_allowed: "Do not schedule above target",
};

export function formatHours(value: number) {
  return `${Number.isInteger(value) ? value.toFixed(0) : value} hours`;
}
