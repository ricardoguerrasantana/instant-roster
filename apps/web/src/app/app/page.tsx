import { redirect } from "next/navigation";

import { signOut } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ApplicationPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;

  if (error || !claims) {
    redirect("/login");
  }

  const email =
    typeof claims.email === "string" ? claims.email : "Email unavailable";

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="font-bold">Instant Roster</p>
            <p className="mt-0.5 text-sm text-gray-600">{email}</p>
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

      <section className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Workspace
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          Your rostering workspace
        </h1>
        <p className="mt-3 max-w-2xl text-gray-700">
          Plan coverage, balance team availability, and keep roster decisions
          clear from one focused workspace.
        </p>
      </section>
    </main>
  );
}
