import Link from "next/link";
import { redirect } from "next/navigation";

import { ApplicationShell } from "@/app/app/application-shell";
import { getOrganisationContext } from "@/lib/organisations/context";

export default async function EmployeeNotFound() {
  const context = await getOrganisationContext();

  if (context.status === "unauthenticated") {
    redirect("/login");
  }

  if (context.status === "needs_onboarding") {
    redirect("/app/onboarding");
  }

  return (
    <ApplicationShell
      activeSection="employees"
      email={context.email}
      organisationName={context.organisation.name}
      role={context.membership.role}
      timezone={context.organisation.timezone}
    >
      <section className="px-6 py-16 text-center lg:px-10">
        <h1 className="text-3xl font-bold tracking-tight">
          Employee unavailable
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-gray-600">
          This employee could not be found in your organisation or is not
          available to you.
        </p>
        <Link
          className="mt-6 inline-flex rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2"
          href="/app/employees"
        >
          Return to employees
        </Link>
      </section>
    </ApplicationShell>
  );
}
