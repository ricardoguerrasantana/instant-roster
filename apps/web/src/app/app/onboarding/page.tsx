import { redirect } from "next/navigation";

import { OnboardingForm } from "@/app/app/onboarding/onboarding-form";
import { signOut } from "@/app/auth/actions";
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
        <header className="flex flex-col gap-4 border-b border-gray-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Instant Roster
            </p>

            <p className="mt-2 text-sm text-gray-600">
              Signed in as{" "}
              <span className="font-medium text-gray-950">
                {context.email}
              </span>
            </p>
          </div>

          <form action={signOut}>
            <button
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-950 hover:text-gray-950 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2"
              type="submit"
            >
              Sign out
            </button>
          </form>
        </header>

        <h1 className="mt-8 text-3xl font-bold tracking-tight sm:text-4xl">
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