import { redirect } from "next/navigation";

import { signOut } from "@/app/auth/actions";
import { getOrganisationContext } from "@/lib/organisations/context";

export const dynamic = "force-dynamic";

export default async function ApplicationPage() {
  const context = await getOrganisationContext();

  if (context.status === "unauthenticated") {
    redirect("/login");
  }

  if (context.status === "needs_onboarding") {
    redirect("/app/onboarding");
  }

  const role =
    context.membership.role.charAt(0).toUpperCase() +
    context.membership.role.slice(1);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-950 lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="border-b border-gray-200 bg-gray-950 px-6 py-6 text-white lg:min-h-screen lg:border-b-0 lg:border-r lg:border-gray-800">
        <div>
          <p className="text-lg font-bold tracking-tight">Instant Roster</p>
          <p className="mt-2 text-sm text-gray-300">
            {context.organisation.name}
          </p>
        </div>

        <nav aria-label="Application" className="mt-8">
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-1">
            {[
              "Roster",
              "Employees",
              "Availability",
              "Sites",
              "Skills",
            ].map((item, index) => (
              <li key={item}>
                <span
                  aria-current={index === 0 ? "page" : undefined}
                  className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                    index === 0
                      ? "bg-white text-gray-950"
                      : "text-gray-300"
                  }`}
                >
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main>
        <header className="border-b border-gray-200 bg-white">
          <div className="flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between lg:px-10">
            <div>
              <p className="font-semibold">{context.email}</p>
              <p className="mt-0.5 text-sm text-gray-600">
                {role} · {context.organisation.timezone}
              </p>
            </div>

            <form action={signOut}>
              <button
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold transition hover:border-gray-950 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2"
                type="submit"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        <section className="px-6 py-10 lg:px-10 lg:py-12">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Roster
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">
            {context.organisation.name}
          </h1>
          <p className="mt-3 max-w-2xl text-gray-700">
            Plan coverage, coordinate team availability, and keep roster
            decisions clear from one focused workspace.
          </p>
        </section>
      </main>
    </div>
  );
}
