"use client";

import Link from "next/link";
import { startTransition, type FormEvent, useActionState } from "react";

import {
  createEmployee,
  updateEmployee,
  type EmployeeActionState,
} from "@/app/app/employees/actions";
import {
  EMPLOYMENT_TYPE_LABELS,
  NEW_EMPLOYEE_VALUES,
  OVERTIME_PREFERENCE_LABELS,
  type EmployeeEditItem,
} from "@/lib/employees/model";
import {
  EMPLOYMENT_TYPES,
  OVERTIME_PREFERENCES,
  type EmployeeFormField,
} from "@/lib/employees/validation";

const INITIAL_STATE: EmployeeActionState = { message: "" };

type EmployeeFormProps = {
  employee?: EmployeeEditItem;
  mode: "create" | "edit";
  mutationsEnabled: boolean;
};

type FieldErrorProps = {
  field: EmployeeFormField;
  state: EmployeeActionState;
};

function FieldError({ field, state }: FieldErrorProps) {
  const error = state.fieldErrors?.[field];

  return error ? (
    <p className="mt-2 text-sm text-red-700" id={`${field}-error`}>
      {error}
    </p>
  ) : null;
}

function describedBy(
  field: EmployeeFormField,
  state: EmployeeActionState,
  helpId?: string,
) {
  const errorId = state.fieldErrors?.[field] ? `${field}-error` : undefined;
  return [helpId, errorId].filter(Boolean).join(" ") || undefined;
}

export function EmployeeForm({
  employee,
  mode,
  mutationsEnabled,
}: EmployeeFormProps) {
  const values = employee ?? NEW_EMPLOYEE_VALUES;
  const action: (
    state: EmployeeActionState,
    formData: FormData,
  ) => Promise<EmployeeActionState> =
    mode === "create"
      ? createEmployee
      : updateEmployee.bind(null, employee?.id ?? "");
  const [state, formAction, pending] = useActionState(
    action,
    INITIAL_STATE,
  );
  const submitLabel = mode === "create" ? "Create employee" : "Save changes";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    // A resolved function form Action resets uncontrolled fields in React 19.
    // Dispatching it explicitly preserves the entries when the Action returns
    // an expected error; successful mutations still redirect from the server.
    startTransition(() => formAction(formData));
  }

  return (
    <>
      {!mutationsEnabled ? (
        <aside
          className="mb-8 rounded-xl border border-amber-300 bg-amber-50 px-5 py-4 text-amber-950"
          role="status"
        >
          <p className="font-semibold">Read-only Preview</p>
          <p className="mt-1 text-sm">
            You can review this form, but employee changes are disabled in
            this environment.
          </p>
        </aside>
      ) : null}

      {state.message ? (
        <div
          aria-live="polite"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800"
          role="alert"
        >
          {state.message}
        </div>
      ) : null}

      <form
        action={formAction}
        className="space-y-8"
        noValidate
        onSubmit={handleSubmit}
      >
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Employee details</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold" htmlFor="fullName">
                Full name
              </label>
              <input
                aria-describedby={describedBy("fullName", state)}
                aria-invalid={Boolean(state.fieldErrors?.fullName)}
                autoComplete="name"
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-gray-950 focus:ring-2 focus:ring-gray-950/10"
                defaultValue={values.fullName}
                id="fullName"
                maxLength={100}
                minLength={2}
                name="fullName"
                required
                type="text"
              />
              <FieldError field="fullName" state={state} />
            </div>

            <div>
              <label
                className="block text-sm font-semibold"
                htmlFor="employeeCode"
              >
                Employee code
              </label>
              <input
                aria-describedby={describedBy(
                  "employeeCode",
                  state,
                  "employeeCode-help",
                )}
                aria-invalid={Boolean(state.fieldErrors?.employeeCode)}
                autoCapitalize="characters"
                autoComplete="off"
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 font-mono outline-none transition focus:border-gray-950 focus:ring-2 focus:ring-gray-950/10"
                defaultValue={values.employeeCode ?? ""}
                id="employeeCode"
                maxLength={30}
                name="employeeCode"
                pattern="[A-Za-z0-9_-]{2,30}"
                spellCheck={false}
                type="text"
              />
              <p className="mt-2 text-sm text-gray-600" id="employeeCode-help">
                Optional. Use letters, numbers, hyphens, or underscores.
              </p>
              <FieldError field="employeeCode" state={state} />
            </div>

            <div>
              <label
                className="block text-sm font-semibold"
                htmlFor="employmentType"
              >
                Employment type
              </label>
              <select
                aria-describedby={describedBy("employmentType", state)}
                aria-invalid={Boolean(state.fieldErrors?.employmentType)}
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none transition focus:border-gray-950 focus:ring-2 focus:ring-gray-950/10"
                defaultValue={values.employmentType}
                id="employmentType"
                name="employmentType"
                required
              >
                {EMPLOYMENT_TYPES.map((employmentType) => (
                  <option key={employmentType} value={employmentType}>
                    {EMPLOYMENT_TYPE_LABELS[employmentType]}
                  </option>
                ))}
              </select>
              <FieldError field="employmentType" state={state} />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Weekly planning hours</h2>
          <p className="mt-2 max-w-3xl text-sm text-gray-600">
            Minimum desired is the least preferred amount, Target is the usual
            goal, Maximum desired is the preferred upper range, and Maximum
            allowed is the firm scheduling limit. These values guide roster
            planning only.
          </p>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                field: "minimumDesiredHours" as const,
                label: "Minimum desired",
                value: values.minimumDesiredHours,
              },
              {
                field: "targetHours" as const,
                label: "Target",
                value: values.targetHours,
              },
              {
                field: "maximumDesiredHours" as const,
                label: "Maximum desired",
                value: values.maximumDesiredHours,
              },
              {
                field: "maximumAllowedHours" as const,
                label: "Maximum allowed",
                value: values.maximumAllowedHours,
              },
            ].map(({ field, label, value }) => (
              <div key={field}>
                <label className="block text-sm font-semibold" htmlFor={field}>
                  {label}
                </label>
                <input
                  aria-describedby={describedBy(field, state)}
                  aria-invalid={Boolean(state.fieldErrors?.[field])}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-gray-950 focus:ring-2 focus:ring-gray-950/10"
                  defaultValue={value}
                  id={field}
                  max={168}
                  min={0}
                  name={field}
                  required
                  step={0.25}
                  type="number"
                />
                <FieldError field={field} state={state} />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Rostering preferences</h2>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div>
              <label
                className="block text-sm font-semibold"
                htmlFor="overtimePreference"
              >
                Additional hours preference
              </label>
              <select
                aria-describedby={describedBy(
                  "overtimePreference",
                  state,
                  "overtimePreference-help",
                )}
                aria-invalid={Boolean(
                  state.fieldErrors?.overtimePreference,
                )}
                className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 outline-none transition focus:border-gray-950 focus:ring-2 focus:ring-gray-950/10"
                defaultValue={values.overtimePreference}
                id="overtimePreference"
                name="overtimePreference"
                required
              >
                {OVERTIME_PREFERENCES.map((preference) => (
                  <option key={preference} value={preference}>
                    {OVERTIME_PREFERENCE_LABELS[preference]}
                  </option>
                ))}
              </select>
              <p
                className="mt-2 text-sm text-gray-600"
                id="overtimePreference-help"
              >
                Guides future rostering above target hours without changing
                the maximum allowed limit.
              </p>
              <FieldError field="overtimePreference" state={state} />
            </div>

            <div>
              <label className="block text-sm font-semibold" htmlFor="notes">
                Operational notes
              </label>
              <textarea
                aria-describedby={describedBy("notes", state, "notes-help")}
                aria-invalid={Boolean(state.fieldErrors?.notes)}
                className="mt-2 min-h-32 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-gray-950 focus:ring-2 focus:ring-gray-950/10"
                defaultValue={values.notes ?? ""}
                id="notes"
                maxLength={2000}
                name="notes"
              />
              <p className="mt-2 text-sm text-gray-600" id="notes-help">
                Use non-sensitive roster information only.
              </p>
              <FieldError field="notes" state={state} />
            </div>
          </div>
        </section>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-center text-sm font-semibold transition hover:border-gray-950 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2"
            href="/app/employees"
          >
            Cancel
          </Link>
          <button
            className="rounded-lg bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
            disabled={pending || !mutationsEnabled}
            type="submit"
          >
            {pending ? "Saving…" : submitLabel}
          </button>
        </div>
      </form>
    </>
  );
}
