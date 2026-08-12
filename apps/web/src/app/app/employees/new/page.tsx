import { redirect } from "next/navigation";

import { ApplicationShell } from "@/app/app/application-shell";
import { EmployeeForm } from "@/app/app/employees/employee-form";
import { mutationsAreEnabled } from "@/lib/environment/mutations";
import { canManageEmployees } from "@/lib/employees/model";
import { getOrganisationContext } from "@/lib/organisations/context";

export const dynamic = "force-dynamic";

export default async function NewEmployeePage() {
  const context = await getOrganisationContext();

  if (context.status === "unauthenticated") {
    redirect("/login");
  }

  if (context.status === "needs_onboarding") {
    redirect("/app/onboarding");
  }

  if (!canManageEmployees(context.membership.role)) {
    redirect("/app/employees?notice=read_only");
  }

  return (
    <ApplicationShell
      activeSection="employees"
      email={context.email}
      organisationName={context.organisation.name}
      role={context.membership.role}
      timezone={context.organisation.timezone}
    >
      <section className="px-6 py-10 lg:px-10 lg:py-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Employees
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          Add employee
        </h1>
        <p className="mt-3 max-w-2xl text-gray-700">
          Add a person to the organisation’s roster register and set their
          default weekly planning preferences.
        </p>

        <div className="mt-8">
          <EmployeeForm
            mode="create"
            mutationsEnabled={mutationsAreEnabled()}
          />
        </div>
      </section>
    </ApplicationShell>
  );
}
