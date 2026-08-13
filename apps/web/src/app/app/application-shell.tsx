import Link from "next/link";

import { signOut } from "@/app/auth/actions";
import type { MembershipRole } from "@/lib/employees/model";

type ApplicationShellProps = {
  activeSection: "employees" | "roster";
  children: React.ReactNode;
  email: string;
  organisationName: string;
  role: MembershipRole;
  timezone: string;
};

const PLACEHOLDER_NAVIGATION = ["Availability", "Sites", "Skills"];

function navigationClass(active: boolean) {
  return `block rounded-lg px-3 py-2 text-sm font-medium transition ${
    active
      ? "bg-white text-gray-950"
      : "text-gray-300 hover:bg-gray-800 hover:text-white"
  }`;
}

export function ApplicationShell({
  activeSection,
  children,
  email,
  organisationName,
  role,
  timezone,
}: ApplicationShellProps) {
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-950 lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="border-b border-gray-200 bg-gray-950 px-6 py-6 text-white lg:min-h-screen lg:border-b-0 lg:border-r lg:border-gray-800">
        <div>
          <p className="text-lg font-bold tracking-tight">Instant Roster</p>
          <p className="mt-2 text-sm text-gray-300">{organisationName}</p>
        </div>

        <nav aria-label="Application" className="mt-8">
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-1">
            <li>
              <Link
                aria-current={
                  activeSection === "roster" ? "page" : undefined
                }
                className={navigationClass(activeSection === "roster")}
                href="/app"
              >
                Roster
              </Link>
            </li>
            <li>
              <Link
                aria-current={
                  activeSection === "employees" ? "page" : undefined
                }
                className={navigationClass(activeSection === "employees")}
                href="/app/employees"
              >
                Employees
              </Link>
            </li>
            {PLACEHOLDER_NAVIGATION.map((item) => (
              <li key={item}>
                <span className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-500">
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
              <p className="font-semibold">{email}</p>
              <p className="mt-0.5 text-sm text-gray-600">
                {roleLabel} · {timezone}
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

        {children}
      </main>
    </div>
  );
}
