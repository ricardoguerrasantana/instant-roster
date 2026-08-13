import Link from "next/link";
import { redirect } from "next/navigation";

import { ApplicationShell } from "@/app/app/application-shell";
import { EmployeeStatusAction } from "@/app/app/employees/employee-status-action";
import { mutationsAreEnabled } from "@/lib/environment/mutations";
import { listEmployees } from "@/lib/employees/data";
import {
  EMPLOYEE_STATUSES,
  normaliseEmployeeListFilters,
} from "@/lib/employees/filters";
import {
  canManageEmployees,
  EMPLOYMENT_TYPE_LABELS,
  formatHours,
  OVERTIME_PREFERENCE_LABELS,
} from "@/lib/employees/model";
import { getOrganisationContext } from "@/lib/organisations/context";

export const dynamic = "force-dynamic";

type EmployeesPageProps = {
  searchParams: Promise<{
    notice?: string | string[];
    q?: string | string[];
    status?: string | string[];
  }>;
};

const STATUS_LABELS = {
  active: "Active",
  inactive: "Inactive",
  all: "All",
} as const;

const NOTICE_MESSAGES: Record<string, string> = {
  created: "Employee created.",
  read_only: "Your role has read-only employee access.",
  updated: "Employee updated.",
};

export default async function EmployeesPage({
  searchParams,
}: EmployeesPageProps) {
  const context = await getOrganisationContext();

  if (context.status === "unauthenticated") {
    redirect("/login");
  }

  if (context.status === "needs_onboarding") {
    redirect("/app/onboarding");
  }

  const rawSearchParams = await searchParams;
  const filters = normaliseEmployeeListFilters(rawSearchParams);
  const employees = await listEmployees(context.organisation.id, filters);
  const canManage = canManageEmployees(context.membership.role);
  const mutationsEnabled = mutationsAreEnabled();
  const noticeCode =
    typeof rawSearchParams.notice === "string"
      ? rawSearchParams.notice
      : "";
  const notice = NOTICE_MESSAGES[noticeCode];

  return (
    <ApplicationShell
      activeSection="employees"
      email={context.email}
      organisationName={context.organisation.name}
      role={context.membership.role}
      timezone={context.organisation.timezone}
    >
      <section className="px-6 py-10 lg:px-10 lg:py-12">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Employees
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">
              Employee register
            </h1>
            <p className="mt-3 max-w-2xl text-gray-700">
              Manage the people available for rostering and their default
              weekly planning preferences.
            </p>
          </div>

          {canManage ? (
            <Link
              className="rounded-lg bg-gray-950 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2"
              href="/app/employees/new"
            >
              Add employee
            </Link>
          ) : null}
        </div>

        {!mutationsEnabled && canManage ? (
          <aside
            className="mt-8 rounded-xl border border-amber-300 bg-amber-50 px-5 py-4 text-amber-950"
            role="status"
          >
            <p className="font-semibold">Read-only Preview</p>
            <p className="mt-1 text-sm">
              Employee information, search, and filters are available, but
              data changes are disabled in this environment.
            </p>
          </aside>
        ) : null}

        {notice ? (
          <p
            aria-live="polite"
            className="mt-8 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-800"
            role="status"
          >
            {notice}
          </p>
        ) : null}

        <form
          className="mt-8 grid gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:grid-cols-[minmax(0,1fr)_12rem_auto] sm:items-end"
          method="get"
        >
          <div>
            <label className="block text-sm font-semibold" htmlFor="q">
              Search
            </label>
            <input
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-gray-950 focus:ring-2 focus:ring-gray-950/10"
              defaultValue={filters.search}
              id="q"
              maxLength={100}
              name="q"
              placeholder="Name or employee code"
              type="search"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold" htmlFor="status">
              Status
            </label>
            <select
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none transition focus:border-gray-950 focus:ring-2 focus:ring-gray-950/10"
              defaultValue={filters.status}
              id="status"
              name="status"
            >
              {EMPLOYEE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3">
            <button
              className="rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2"
              type="submit"
            >
              Apply
            </button>
            {filters.search || filters.status !== "active" ? (
              <Link
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold transition hover:border-gray-950 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2"
                href="/app/employees"
              >
                Clear
              </Link>
            ) : null}
          </div>
        </form>

        {employees.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
            <h2 className="text-xl font-semibold">No employees found</h2>
            <p className="mx-auto mt-2 max-w-lg text-gray-600">
              {filters.search
                ? "No employee matches this search and status filter."
                : `There are no ${STATUS_LABELS[filters.status].toLowerCase()} employees to show.`}
            </p>
            {canManage ? (
              <Link
                className="mt-6 inline-flex rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2"
                href="/app/employees/new"
              >
                Add employee
              </Link>
            ) : null}
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="hidden grid-cols-[minmax(12rem,1.4fr)_9rem_7rem_8rem_minmax(12rem,1.2fr)_7rem_11rem] gap-4 border-b border-gray-200 bg-gray-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 lg:grid">
              <span>Employee</span>
              <span>Employment</span>
              <span>Target</span>
              <span>Max allowed</span>
              <span>Additional hours</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            <ul className="divide-y divide-gray-200">
              {employees.map((employee) => (
                <li
                  className="grid gap-4 px-5 py-5 sm:grid-cols-2 lg:grid-cols-[minmax(12rem,1.4fr)_9rem_7rem_8rem_minmax(12rem,1.2fr)_7rem_11rem] lg:items-center"
                  key={employee.id}
                >
                  <div>
                    <p className="font-semibold">{employee.full_name}</p>
                    <p className="mt-1 font-mono text-xs text-gray-500">
                      {employee.employee_code ?? "No code"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase text-gray-500 lg:hidden">
                      Employment
                    </span>
                    <p className="mt-1 text-sm lg:mt-0">
                      {EMPLOYMENT_TYPE_LABELS[employee.employment_type]}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase text-gray-500 lg:hidden">
                      Target
                    </span>
                    <p className="mt-1 text-sm lg:mt-0">
                      {formatHours(employee.default_target_hours)}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase text-gray-500 lg:hidden">
                      Max allowed
                    </span>
                    <p className="mt-1 text-sm lg:mt-0">
                      {formatHours(employee.default_maximum_allowed_hours)}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase text-gray-500 lg:hidden">
                      Additional hours
                    </span>
                    <p className="mt-1 text-sm lg:mt-0">
                      {
                        OVERTIME_PREFERENCE_LABELS[
                          employee.default_overtime_preference
                        ]
                      }
                    </p>
                  </div>
                  <div>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        employee.active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {employee.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-start gap-4">
                    {canManage ? (
                      <>
                        <Link
                          className="text-sm font-semibold text-gray-700 underline-offset-4 hover:text-gray-950 hover:underline focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2"
                          href={`/app/employees/${employee.id}/edit`}
                        >
                          Edit
                        </Link>
                        <EmployeeStatusAction
                          active={employee.active}
                          employeeId={employee.id}
                          mutationsEnabled={mutationsEnabled}
                        />
                      </>
                    ) : (
                      <span className="text-sm text-gray-500">View only</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </ApplicationShell>
  );
}
