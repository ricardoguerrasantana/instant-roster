import { redirect } from "next/navigation";

import { OnboardingForm } from "@/app/app/onboarding/onboarding-form";
import { mutationsAreEnabled } from "@/lib/environment/mutations";
import { getOrganisationContext } from "@/lib/organisations/context";

export const dynamic = "force-dynamic";

export default async function OrganisationOnboardingPage() {
  const context = await getOrganisationContext();

  if (context.status === "unauthenticated") {
    redirect("/login");
  }

  if (context.status === "active_membership") {
    redirect("/app");
  }

  const mutationsEnabled = mutationsAreEnabled();

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12 text-gray-950">
      <section className="mx-auto w-full max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Instant Roster
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Create your organisation
        </h1>
        <p className="mt-3 max-w-xl text-gray-600">
          Set up the workspace where your team will plan coverage, coordinate
          availability, and build clear rosters.
        </p>

        <div className="mt-8">
          <OnboardingForm mutationsEnabled={mutationsEnabled} />
        </div>
      </section>
    </main>
  );
}
