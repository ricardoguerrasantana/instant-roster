export default function HomePage() {
  return (
    <main className="min-h-screen bg-white p-8 text-gray-950">
      <section className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Instant Roster
        </p>

        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Staff satisfaction rostering — live deployment test
        </h1>

        <p className="mt-4 max-w-2xl text-lg text-gray-700">
          A rostering platform focused on coverage, availability, preferred
          hours, overtime preferences, fairness, and staff goal achievement.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 p-5">
            <h2 className="text-xl font-semibold">Current focus</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-gray-700">
              <li>Assign people to shifts.</li>
              <li>Respect availability and skills.</li>
              <li>Track each person&apos;s target hours.</li>
              <li>Show goal achievement percentage.</li>
              <li>Balance overtime preference and fairness.</li>
            </ul>
          </div>

          <div className="rounded-xl border border-gray-200 p-5">
            <h2 className="text-xl font-semibold">Not included yet</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-gray-700">
              <li>Wages.</li>
              <li>Penalty rates.</li>
              <li>Allowances.</li>
              <li>Payroll export.</li>
              <li>Labour-cost optimisation.</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
