"use client";

import { useActionState } from "react";

import {
  deactivateEmployee,
  reactivateEmployee,
  type EmployeeStatusActionState,
} from "@/app/app/employees/actions";

const INITIAL_STATE: EmployeeStatusActionState = {
  message: "",
  status: "idle",
};

const DEACTIVATE_CONFIRMATION =
  "Deactivate this employee? Their record and history will be kept, but they will no longer appear in the Active employee list.";
const REACTIVATE_CONFIRMATION =
  "Reactivate this employee? They will return to the Active employee list.";

type EmployeeStatusActionProps = {
  active: boolean;
  employeeId: string;
  mutationsEnabled: boolean;
};

export function EmployeeStatusAction({
  active,
  employeeId,
  mutationsEnabled,
}: EmployeeStatusActionProps) {
  const action = active ? deactivateEmployee : reactivateEmployee;
  const [state, formAction, pending] = useActionState(
    action.bind(null, employeeId),
    INITIAL_STATE,
  );
  const label = active ? "Deactivate" : "Reactivate";
  const confirmation = active
    ? DEACTIVATE_CONFIRMATION
    : REACTIVATE_CONFIRMATION;

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm(confirmation)) {
          event.preventDefault();
        }
      }}
    >
      <button
        className="text-sm font-semibold text-gray-700 underline-offset-4 hover:text-gray-950 hover:underline focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:text-gray-400 disabled:no-underline"
        disabled={pending || !mutationsEnabled}
        type="submit"
      >
        {pending ? "Saving…" : label}
      </button>
      {state.status === "error" ? (
        <p
          aria-live="polite"
          className="mt-2 max-w-48 text-xs text-red-700"
          role="alert"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
