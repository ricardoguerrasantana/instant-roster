export const EMPLOYEE_STATUSES = ["active", "inactive", "all"] as const;

export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number];

export type EmployeeListFilters = {
  search: string;
  status: EmployeeStatus;
};

export type EmployeeListSearchParams = {
  q?: string | string[];
  status?: string | string[];
};

const MAX_SEARCH_LENGTH = 100;
const EMPLOYEE_STATUS_SET = new Set<string>(EMPLOYEE_STATUSES);

function normaliseSingleValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export function normaliseEmployeeListFilters(
  searchParams: EmployeeListSearchParams,
): EmployeeListFilters {
  const rawStatus = normaliseSingleValue(searchParams.status);
  const status = EMPLOYEE_STATUS_SET.has(rawStatus)
    ? (rawStatus as EmployeeStatus)
    : "active";
  const normalisedSearch = normaliseSingleValue(searchParams.q)
    .trim()
    .replace(/\s+/g, " ");
  const search = Array.from(normalisedSearch)
    .slice(0, MAX_SEARCH_LENGTH)
    .join("");

  return { search, status };
}

export function employeeStatusValue(status: EmployeeStatus) {
  if (status === "active") {
    return true;
  }

  if (status === "inactive") {
    return false;
  }

  return undefined;
}

export function employeeSearchPattern(search: string) {
  if (!search) {
    return null;
  }

  const escapedSearch = search.replace(/[\\%_]/g, "\\$&");
  return `%${escapedSearch}%`;
}

export function mergeEmployeeSearchResults<
  Employee extends { full_name: string; id: string },
>(nameMatches: Employee[], codeMatches: Employee[]) {
  const employeesById = new Map<string, Employee>();

  for (const employee of nameMatches) {
    employeesById.set(employee.id, employee);
  }

  for (const employee of codeMatches) {
    employeesById.set(employee.id, employee);
  }

  return Array.from(employeesById.values()).sort(
    (left, right) =>
      left.full_name.localeCompare(right.full_name, "en", {
        sensitivity: "base",
      }) || left.id.localeCompare(right.id),
  );
}
