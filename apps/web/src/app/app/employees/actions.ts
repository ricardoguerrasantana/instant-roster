"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  assertMutationsAllowed,
  MutationsDisabledError,
} from "@/lib/environment/mutations";
import {
  EmployeeDataError,
  getEmployeeMutationTarget,
} from "@/lib/employees/data";
import { canManageEmployees } from "@/lib/employees/model";
import {
  isEmployeeId,
  validateEmployeeFormData,
  type EmployeeFormField,
} from "@/lib/employees/validation";
import { getOrganisationContext } from "@/lib/organisations/context";
import { createClient } from "@/lib/supabase/server";

export type EmployeeActionState = {
  message: string;
  fieldErrors?: Partial<Record<EmployeeFormField, string>>;
};

export type EmployeeStatusActionState = {
  message: string;
  status: "idle" | "error" | "success";
};

type ManagerContext = Extract<
  Awaited<ReturnType<typeof getOrganisationContext>>,
  { status: "active_membership" }
>;

type AuthorisationResult =
  | { context: ManagerContext; state?: never }
  | { context?: never; state: EmployeeActionState };

function mutationGuardError(error: unknown): EmployeeActionState {
  if (error instanceof MutationsDisabledError) {
    return { message: error.message };
  }

  return { message: "Data changes are not available right now." };
}

async function authoriseEmployeeManager(): Promise<AuthorisationResult> {
  let context: Awaited<ReturnType<typeof getOrganisationContext>>;

  try {
    context = await getOrganisationContext();
  } catch {
    return {
      state: {
        message: "We could not verify your organisation access right now.",
      },
    };
  }

  if (context.status === "unauthenticated") {
    return {
      state: { message: "Your session could not be verified. Sign in again." },
    };
  }

  if (context.status === "needs_onboarding") {
    return {
      state: { message: "An active organisation is required." },
    };
  }

  if (!canManageEmployees(context.membership.role)) {
    return {
      state: { message: "You do not have permission to manage employees." },
    };
  }

  return { context };
}

function safeMutationError(code?: string): EmployeeActionState {
  if (code === "23505") {
    return {
      message: "That employee code is already in use in this organisation.",
      fieldErrors: {
        employeeCode: "Choose a different employee code.",
      },
    };
  }

  if (code === "23514" || code === "22003" || code === "22P02") {
    return {
      message: "The employee details did not meet the required rules.",
    };
  }

  if (code === "42501") {
    return { message: "You do not have permission to change this employee." };
  }

  return {
    message: "We could not save this employee right now. Try again.",
  };
}

function statusStateFromActionState(
  state: EmployeeActionState,
): EmployeeStatusActionState {
  return { message: state.message, status: "error" };
}

export async function createEmployee(
  _previousState: EmployeeActionState,
  formData: FormData,
): Promise<EmployeeActionState> {
  try {
    assertMutationsAllowed();
  } catch (error) {
    return mutationGuardError(error);
  }

  const authorisation = await authoriseEmployeeManager();

  if (authorisation.state) {
    return authorisation.state;
  }

  const validation = validateEmployeeFormData(formData);

  if (!validation.success) {
    return {
      message: "Check the highlighted fields and try again.",
      fieldErrors: validation.fieldErrors,
    };
  }

  const { data } = validation;
  const supabase = await createClient();

  try {
    const { error } = await supabase.from("employees").insert({
      organisation_id: authorisation.context.organisation.id,
      employee_code: data.employeeCode,
      full_name: data.fullName,
      employment_type: data.employmentType,
      default_minimum_desired_hours: data.minimumDesiredHours,
      default_target_hours: data.targetHours,
      default_maximum_desired_hours: data.maximumDesiredHours,
      default_maximum_allowed_hours: data.maximumAllowedHours,
      default_overtime_preference: data.overtimePreference,
      active: true,
      notes: data.notes,
    });

    if (error) {
      return safeMutationError(error.code);
    }
  } catch {
    return safeMutationError();
  }

  revalidatePath("/app/employees");
  redirect("/app/employees?notice=created");
}

export async function updateEmployee(
  employeeId: string,
  _previousState: EmployeeActionState,
  formData: FormData,
): Promise<EmployeeActionState> {
  try {
    assertMutationsAllowed();
  } catch (error) {
    return mutationGuardError(error);
  }

  const authorisation = await authoriseEmployeeManager();

  if (authorisation.state) {
    return authorisation.state;
  }

  const validation = validateEmployeeFormData(formData);

  if (!validation.success) {
    return {
      message: "Check the highlighted fields and try again.",
      fieldErrors: validation.fieldErrors,
    };
  }

  if (!isEmployeeId(employeeId)) {
    return { message: "This employee is not available." };
  }

  const organisationId = authorisation.context.organisation.id;

  try {
    const target = await getEmployeeMutationTarget(
      organisationId,
      employeeId,
    );

    if (!target) {
      return { message: "This employee is not available." };
    }
  } catch (error) {
    if (error instanceof EmployeeDataError) {
      return { message: "We could not verify this employee right now." };
    }

    return safeMutationError();
  }

  const { data } = validation;
  const supabase = await createClient();

  try {
    const { data: updatedEmployee, error } = await supabase
      .from("employees")
      .update({
        employee_code: data.employeeCode,
        full_name: data.fullName,
        employment_type: data.employmentType,
        default_minimum_desired_hours: data.minimumDesiredHours,
        default_target_hours: data.targetHours,
        default_maximum_desired_hours: data.maximumDesiredHours,
        default_maximum_allowed_hours: data.maximumAllowedHours,
        default_overtime_preference: data.overtimePreference,
        notes: data.notes,
      })
      .eq("organisation_id", organisationId)
      .eq("id", employeeId)
      .select("id")
      .maybeSingle();

    if (error) {
      return safeMutationError(error.code);
    }

    if (!updatedEmployee) {
      return { message: "This employee is not available." };
    }
  } catch {
    return safeMutationError();
  }

  revalidatePath("/app/employees");
  revalidatePath(`/app/employees/${employeeId}/edit`);
  redirect("/app/employees?notice=updated");
}

async function changeEmployeeStatus(
  employeeId: string,
  active: boolean,
): Promise<EmployeeStatusActionState> {
  const authorisation = await authoriseEmployeeManager();

  if (authorisation.state) {
    return statusStateFromActionState(authorisation.state);
  }

  if (!isEmployeeId(employeeId)) {
    return {
      message: "This employee is not available.",
      status: "error",
    };
  }

  const organisationId = authorisation.context.organisation.id;
  let target: Awaited<ReturnType<typeof getEmployeeMutationTarget>>;

  try {
    target = await getEmployeeMutationTarget(organisationId, employeeId);
  } catch {
    return {
      message: "We could not verify this employee right now.",
      status: "error",
    };
  }

  if (!target) {
    return {
      message: "This employee is not available.",
      status: "error",
    };
  }

  if (target.active === active) {
    return {
      message: active
        ? "This employee is already active."
        : "This employee is already inactive.",
      status: "error",
    };
  }

  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("employees")
      .update({ active })
      .eq("organisation_id", organisationId)
      .eq("id", employeeId)
      .select("id")
      .maybeSingle();

    if (error) {
      return statusStateFromActionState(safeMutationError(error.code));
    }

    if (!data) {
      return {
        message: "This employee is not available.",
        status: "error",
      };
    }
  } catch {
    return statusStateFromActionState(safeMutationError());
  }

  revalidatePath("/app/employees");
  revalidatePath(`/app/employees/${employeeId}/edit`);

  return {
    message: active ? "Employee reactivated." : "Employee deactivated.",
    status: "success",
  };
}

export async function deactivateEmployee(
  employeeId: string,
  _previousState: EmployeeStatusActionState,
  _formData: FormData,
): Promise<EmployeeStatusActionState> {
  try {
    assertMutationsAllowed();
  } catch (error) {
    return statusStateFromActionState(mutationGuardError(error));
  }

  void _previousState;
  void _formData;

  return changeEmployeeStatus(employeeId, false);
}

export async function reactivateEmployee(
  employeeId: string,
  _previousState: EmployeeStatusActionState,
  _formData: FormData,
): Promise<EmployeeStatusActionState> {
  try {
    assertMutationsAllowed();
  } catch (error) {
    return statusStateFromActionState(mutationGuardError(error));
  }

  void _previousState;
  void _formData;

  return changeEmployeeStatus(employeeId, true);
}
