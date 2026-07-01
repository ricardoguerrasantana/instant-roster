export default function HomePage() {
  return (
    <main className="min-h-screen bg-white p-8 text-gray-950">
      <section className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Instant Roster
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Rewarding rostering for smarter teams
        </h1>

        <p className="mt-4 max-w-2xl text-lg text-gray-700">
          Plan shifts, match availability, balance workloads, and create
          rosters that help teams work better.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-gray-200 p-5">
            <h2 className="text-xl font-semibold">Plan</h2>
            <p className="mt-3 text-gray-700">
              Build weekly rosters around real shift requirements, team
              availability, and operational coverage.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 p-5">
            <h2 className="text-xl font-semibold">Balance</h2>
            <p className="mt-3 text-gray-700">
              Track preferred hours, workload distribution, overtime
              preferences, and fairness across the roster.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 p-5">
            <h2 className="text-xl font-semibold">Adapt</h2>
            <p className="mt-3 text-gray-700">
              Respond to changing availability, shift needs, and last-minute
              roster adjustments with clearer decisions.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
