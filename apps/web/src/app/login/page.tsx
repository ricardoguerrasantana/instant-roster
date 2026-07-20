import Link from "next/link";
import { redirect } from "next/navigation";

import { signIn } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";

type LoginPageProps = {
  searchParams: Promise<{ error?: string | string[] }>;
};

const errorMessages: Record<string, string> = {
  invalid_credentials: "The email or password you entered is incorrect.",
  missing_credentials: "Enter both your email address and password.",
  sign_in_failed: "We could not sign you in right now. Please try again.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (!error && data?.claims) {
    redirect("/app");
  }

  const { error: errorCode } = await searchParams;
  const message =
    typeof errorCode === "string" ? errorMessages[errorCode] : undefined;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12 text-gray-950">
      <section className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <Link
          className="text-sm font-semibold text-gray-600 hover:text-gray-950"
          href="/"
        >
          Instant Roster
        </Link>

        <h1 className="mt-6 text-3xl font-bold tracking-tight">Sign in</h1>
        <p className="mt-2 text-gray-600">
          Access your roster workspace with your account email and password.
        </p>

        {message ? (
          <p
            aria-live="polite"
            className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {message}
          </p>
        ) : null}

        <form action={signIn} className="mt-6 space-y-5">
          <div>
            <label className="block text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input
              autoComplete="email"
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-gray-950 focus:ring-2 focus:ring-gray-950/10"
              id="email"
              name="email"
              required
              type="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium" htmlFor="password">
              Password
            </label>
            <input
              autoComplete="current-password"
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none transition focus:border-gray-950 focus:ring-2 focus:ring-gray-950/10"
              id="password"
              name="password"
              required
              type="password"
            />
          </div>

          <button
            className="w-full rounded-lg bg-gray-950 px-4 py-2.5 font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2"
            type="submit"
          >
            Sign in
          </button>
        </form>
      </section>
    </main>
  );
}
