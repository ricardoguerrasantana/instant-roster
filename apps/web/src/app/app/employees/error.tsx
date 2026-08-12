"use client";

import Link from "next/link";

export default function EmployeesError({ reset }: { reset: () => void }) {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-16 text-center text-gray-950">
      <h1 className="text-3xl font-bold tracking-tight">
        Employee information is unavailable
      </h1>
      <p className="mx-auto mt-3 max-w-xl text-gray-600">
        We could not load employee information right now. No data was changed.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          className="rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2"
          onClick={reset}
          type="button"
        >
          Try again
        </button>
        <Link
          className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold transition hover:border-gray-950 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2"
          href="/app"
        >
          Return to workspace
        </Link>
      </div>
    </main>
  );
}
