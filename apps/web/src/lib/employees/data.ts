import "server-only";

import {
  employeeSearchPattern,
  employeeStatusValue,
  mergeEmployeeSearchResults,
  type EmployeeListFilters,
} from "@/lib/employees/filters";
import type {
  EmployeeEditItem,
  EmployeeListItem,
} from "@/lib/employees/model";
import { isEmployeeId } from "@/lib/employees/validation";
import { createClient } from "@/lib/supabase/server";

const EMPLOYEE_LIST_COLUMNS = `
  id,
  employee_code,
  full_name,
  employment_type,
  default_target_hours,
  default_maximum_allowed_hours,
  default_overtime_preference,
  active
`;

const EMPLOYEE_EDIT_COLUMNS = `
  id,
  employee_code,
  full_name,
  employment_type,
  default_minimum_desired_hours,
  default_target_hours,
  default_maximum_desired_hours,
  default_maximum_allowed_hours,
  default_overtime_preference,
  notes,
  active
`;

export class EmployeeDataError extends Error {
  constructor() {
    super("We could not load employee information right now.");
    this.name = "EmployeeDataError";
  }
}

export async function listEmployees(
  organisationId: string,
  filters: EmployeeListFilters,
): Promise<EmployeeListItem[]> {
  const supabase = await createClient();
  const active = employeeStatusValue(filters.status);
  const pattern = employeeSearchPattern(filters.search);

  function buildQuery() {
    let query = supabase
      .from("employees")
      .select(EMPLOYEE_LIST_COLUMNS)
      .eq("organisation_id", organisationId);

    if (active !== undefined) {
      query = query.eq("active", active);
    }

    return query;
  }

  if (!pattern) {
    const { data, error } = await buildQuery()
      .order("full_name", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      throw new EmployeeDataError();
    }

    return data;
  }

  const [nameResult, codeResult] = await Promise.all([
    buildQuery()
      .ilike("full_name", pattern)
      .order("full_name", { ascending: true })
      .order("id", { ascending: true }),
    buildQuery()
      .ilike("employee_code", pattern)
      .order("full_name", { ascending: true })
      .order("id", { ascending: true }),
  ]);

  if (nameResult.error || codeResult.error) {
    throw new EmployeeDataError();
  }

  return mergeEmployeeSearchResults(nameResult.data, codeResult.data);
}

export async function getEmployeeForEdit(
  organisationId: string,
  employeeId: string,
): Promise<EmployeeEditItem | null> {
  if (!isEmployeeId(employeeId)) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("employees")
    .select(EMPLOYEE_EDIT_COLUMNS)
    .eq("organisation_id", organisationId)
    .eq("id", employeeId)
    .maybeSingle();

  if (error) {
    throw new EmployeeDataError();
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    employeeCode: data.employee_code,
    fullName: data.full_name,
    employmentType: data.employment_type,
    minimumDesiredHours: data.default_minimum_desired_hours,
    targetHours: data.default_target_hours,
    maximumDesiredHours: data.default_maximum_desired_hours,
    maximumAllowedHours: data.default_maximum_allowed_hours,
    overtimePreference: data.default_overtime_preference,
    notes: data.notes,
    active: data.active,
  };
}

export async function getEmployeeMutationTarget(
  organisationId: string,
  employeeId: string,
) {
  if (!isEmployeeId(employeeId)) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("employees")
    .select("id, active")
    .eq("organisation_id", organisationId)
    .eq("id", employeeId)
    .maybeSingle();

  if (error) {
    throw new EmployeeDataError();
  }

  return data;
}
