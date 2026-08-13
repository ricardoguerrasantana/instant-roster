# Employee Management

## Status

Rules approved. Stage A is independently reviewed, merged, deployed to hosted
Supabase, and verified. Stage B is implemented, committed locally, validated
locally, independently reviewed, and product-owner UI tested on
`feat/employee-application`. Push, pull request, CI, hosted Preview validation,
merge, and Production verification remain pending.

## Business problem

Instant Roster needs a reliable employee register before managers can define availability, skills, shift requirements, roster goals, or generate rosters.

The employee register must provide one organisation-controlled source of truth for:

- who may be assigned to work;
- each employee's employment type;
- the employee's default weekly hour goals and limits;
- their preference for hours above their target;
- whether they are currently active;
- the identifiers roster managers use operationally.

Employee Management must work across different industries without introducing payroll, wage, award, or labour-cost logic.

## Users

The feature is used by authenticated members of an organisation:

- Owners
- Administrators
- Managers
- Schedulers
- Viewers

Employees stored in the register do not need an Instant Roster login.

An employee may be linked to an application profile in a future feature, but profile linking is not managed through this feature.

## Roles and permissions

| Role | View employees | Create | Edit | Deactivate/reactivate | Delete |
| --- | --- | --- | --- | --- | --- |
| Owner | Yes | Yes | Yes | Yes | No |
| Admin | Yes | Yes | Yes | Yes | No |
| Manager | Yes | Yes | Yes | Yes | No |
| Scheduler | Yes | No | No | No | No |
| Viewer | Yes | No | No | No | No |

Additional rules:

1. Every role requires an active organisation membership.
2. Every role may view active and inactive employees belonging to its own organisation.
3. Scheduler and Viewer receive a read-only employee interface.
4. Write controls are not rendered for Scheduler or Viewer.
5. Direct requests to create, edit, deactivate, or reactivate must still be rejected server-side for Scheduler and Viewer.
6. No organisation role may permanently delete an employee.
7. No role may use this feature to modify `organisation_id`, `profile_id`, record IDs, creation timestamps, or ownership fields.

## Business rules

1. Every employee belongs to exactly one organisation.

2. Organisation scope is derived from the authenticated user's active membership. The browser must never be treated as the trusted source of an organisation ID.

3. An employee does not need an Instant Roster user account.

4. `full_name` is required:
   - leading and trailing spaces are removed;
   - repeated internal spaces are collapsed;
   - length must be between 2 and 100 characters;
   - names do not need to be unique.

5. `employee_code` is optional:
   - it is an operational identifier, not a database ID;
   - leading and trailing spaces are removed;
   - it is stored in uppercase;
   - it may contain uppercase letters, numbers, hyphens, and underscores;
   - length must be between 2 and 30 characters when provided;
   - it must be unique within the organisation without regard to letter case;
   - the same code may exist in another organisation.

6. `employment_type` is required and must be one of:
   - `full_time`
   - `part_time`
   - `casual`
   - `contractor`
   - `other`

7. The following fields represent default weekly rostering goals, not payroll or legal ordinary-hour calculations:
   - minimum desired hours;
   - target hours;
   - maximum desired hours;
   - maximum allowed hours.

8. All default hour values are required, non-negative, and must satisfy:

   `minimum desired <= target <= maximum desired <= maximum allowed`

9. Maximum allowed hours cannot exceed 168 hours in one week.

10. The form accepts hours in quarter-hour increments. Examples:
    - 20
    - 37.5
    - 38
    - 42.25

11. Employment type does not automatically determine the hour values. The authorised manager remains responsible for entering the operational goals appropriate to the employee.

12. The default values for a newly opened employee form are:
    - employment type: `full_time`
    - minimum desired hours: `0`
    - target hours: `38`
    - maximum desired hours: `38`
    - maximum allowed hours: `38`
    - additional-hours preference: `neutral`
    - active: `true`

13. The stored `default_overtime_preference` is presented to users as **Additional hours preference**. Its options are:

    | Stored value | User-facing label | Rostering meaning |
    | --- | --- | --- |
    | `likes_overtime` | Open to additional hours | Prefer the employee when hours above target are needed, without exceeding maximum allowed |
    | `neutral` | Neutral | No positive or negative preference |
    | `avoid_overtime` | Prefer to avoid additional hours | Use hours above target only when roster requirements justify it |
    | `not_allowed` | Do not schedule above target | Future optimisation must not assign above target hours |

14. This preference is a rostering input only. It does not calculate legal overtime, pay rates, penalties, allowances, or payroll.

15. `notes` is optional and limited to 2,000 characters.

16. Notes must contain operational rostering information only. They must not be used for:
    - medical information;
    - payroll or bank information;
    - disciplinary records;
    - identity documents;
    - visa documents;
    - sensitive personal assessments.

17. Every organisation member who can view an employee may also view the operational notes.

18. Employees are deactivated rather than deleted.

19. Deactivation:
    - sets `active` to `false`;
    - preserves the employee and all historical relationships;
    - removes the employee from the default Active list;
    - does not remove skills, availability, prior assignments, or roster history;
    - does not automatically alter future roster records in this feature.

20. Reactivation sets `active` to `true` and returns the employee to the default Active list.

21. Deactivation and reactivation require an explicit confirmation from the user.

22. Inactive employees remain searchable and editable by authorised roles.

23. The default employee list displays active employees only.

24. The list supports:
    - search by full name or employee code;
    - status filter: Active, Inactive, All;
    - default sorting by full name;
    - a clear empty state when no employee matches.

25. The employee list displays:
    - name;
    - employee code;
    - employment type;
    - target hours;
    - maximum allowed hours;
    - additional-hours preference;
    - status;
    - permitted actions.

26. Employee records are not physically deleted through the application, database API, or UI.

27. `profile_id` remains unchanged and is not exposed in forms.

28. Every successful create or update uses the existing database `updated_at` mechanism.

29. Invalid input must produce safe, field-specific feedback without exposing raw PostgreSQL, Supabase, policy, or internal error details.

30. A duplicate employee code must produce a clear message that the code is already in use within the organisation.

## Data model

This feature uses the existing `public.employees` table.

Relevant fields:

- `id`
- `organisation_id`
- `profile_id`
- `employee_code`
- `full_name`
- `employment_type`
- `default_target_hours`
- `default_minimum_desired_hours`
- `default_maximum_desired_hours`
- `default_maximum_allowed_hours`
- `default_overtime_preference`
- `active`
- `notes`
- `created_at`
- `updated_at`

Database changes required:

1. Add organisation-scoped SELECT policy for all active organisation members.

2. Add INSERT and UPDATE policies for:
   - Owner
   - Admin
   - Manager

3. Do not create a DELETE policy.

4. Preserve RLS for anonymous and cross-organisation denial.

5. Add a private employee-management role helper if required rather than relying on browser-supplied roles.

6. Prevent changing an employee's organisation after creation.

7. Prevent authenticated application users from directly modifying:
   - `id`
   - `organisation_id` after creation
   - `profile_id`
   - `created_at`
   - `updated_at`

8. Add or refine database validation for:
   - full-name length;
   - employee-code format;
   - case-insensitive employee-code uniqueness per organisation;
   - maximum allowed hours no greater than 168;
   - notes length;
   - existing hour relationships.

9. Add useful indexes for:
   - organisation and active status;
   - organisation and full name;
   - case-insensitive organisation employee-code lookup.

10. Existing dependent and historical records must not be deleted when an employee is deactivated.

No new employee table is required.

## User journeys

### View employees

1. User signs in.
2. User has an active organisation membership.
3. User selects Employees from the application navigation.
4. The Active employee list appears.
5. User can search by name or code.
6. User can change the status filter to Inactive or All.
7. Read-only roles see the data without write controls.

### Create employee

1. Owner, Admin, or Manager opens Employees.
2. User selects Add employee.
3. User completes the employee form.
4. Client-side controls help with input, but the Server Action validates all data again.
5. The Server Action revalidates authentication, membership, role, and mutation permission.
6. Organisation ID is derived server-side.
7. The employee is inserted under the authenticated organisation.
8. User returns to the employee list with a success notice.

### Edit employee

1. Authorised user opens an employee belonging to the organisation.
2. The form loads the existing editable values.
3. User submits changes.
4. The Server Action confirms the employee still belongs to the current organisation.
5. The employee is updated.
6. User returns to the employee list or employee detail page with confirmation.

### Deactivate employee

1. Authorised user selects Deactivate.
2. A confirmation explains that the employee will be unavailable for normal active selection but history will be preserved.
3. The Server Action independently validates access.
4. `active` becomes `false`.
5. The employee disappears from the default Active list.

### Reactivate employee

1. Authorised user finds the employee through Inactive or All.
2. User selects Reactivate and confirms.
3. `active` becomes `true`.
4. The employee returns to the Active list.

### Permission denied

1. Scheduler or Viewer can open the employee list.
2. Create, edit, deactivate, and reactivate controls are not displayed.
3. A direct mutation request is rejected.
4. A direct request to a management-only page shows a clear permission message or returns safely to the employee list.

### Cross-organisation attempt

1. A user attempts to request or modify an employee belonging to another organisation.
2. RLS returns no accessible record or denies the mutation.
3. The application does not disclose whether that employee exists.

### Empty state

1. The organisation has no active employees or no results match the filters.
2. The interface displays a clear empty state.
3. Authorised managers are offered Add employee where appropriate.

## Acceptance criteria

1. Authenticated active organisation members can view employees only from their organisation.

2. Anonymous users cannot read or modify employee records.

3. Cross-organisation reads and writes are denied by database policy.

4. Owner, Admin, and Manager can create employees.

5. Owner, Admin, and Manager can edit employees belonging to their organisation.

6. Owner, Admin, and Manager can deactivate and reactivate employees.

7. Scheduler and Viewer can read employees but cannot create or modify them.

8. No role can delete an employee.

9. A direct Server Action request without valid authentication is rejected.

10. A direct Server Action request without a permitted role is rejected.

11. Every mutation is rejected when application mutations are disabled.

12. Vercel Preview cannot create, edit, deactivate, or reactivate employees.

13. Organisation ID is not accepted as a trusted form field.

14. Employee ID supplied for edit or status change is treated only as a lookup identifier and must resolve inside the current organisation.

15. Duplicate employee codes in the same organisation are rejected regardless of letter case.

16. The same employee code may be used by different organisations.

17. Invalid hour relationships are rejected in both the application and database.

18. Maximum allowed hours above 168 are rejected.

19. Inactive employees are excluded from the default list.

20. Inactive employees remain visible through the Inactive or All filter.

21. Search works against full name and employee code.

22. Deactivation preserves the database row and historical relationships.

23. The navigation contains a functional Employees link.

24. All new database policies and constraints have automated pgTAP coverage.

25. Generated Supabase TypeScript types are current.

26. Next.js lint and production build pass.

27. Application errors do not expose credentials, raw SQL, PostgreSQL internals, or RLS policy internals.

## Security and tenant-isolation requirements

1. RLS remains enabled on `public.employees`.

2. All employee policies explicitly target `authenticated`.

3. SELECT access requires active organisation membership.

4. INSERT and UPDATE access require an active Owner, Admin, or Manager membership.

5. No DELETE policy is created.

6. Database policies are the final authority even when the UI hides controls.

7. Every employee Server Action independently validates:
   - authenticated identity;
   - active organisation membership;
   - permitted role;
   - mutation environment;
   - input values;
   - employee organisation ownership for existing records.

8. The organisation is derived from server-side membership context.

9. The browser does not supply a trusted organisation ID, user ID, owner ID, role, profile ID, or authorisation result.

10. The Supabase publishable client is used with the authenticated user's session. No service-role or secret key is used.

11. Cross-tenant access must be denied even when an attacker knows a valid employee UUID.

12. Operational notes are not a location for sensitive personal, health, payroll, disciplinary, visa, or identity data.

13. Server errors are mapped to safe messages.

14. Preview write protection is enforced server-side and not only through disabled buttons.

15. No employee mutation may alter organisation ownership or profile linkage.

## Preview behaviour

Vercel Preview remains read-only.

Preview may:

- authenticate an approved hosted user;
- render the employee list according to hosted RLS;
- search and filter employees;
- display employee forms for review;
- display read-only notices.

Preview must not:

- create an employee;
- edit an employee;
- deactivate an employee;
- reactivate an employee;
- bypass the mutation guard through a direct Server Action request.

Because Preview and Production currently share the hosted Supabase project, Preview may display real organisation data permitted by RLS. Preview access therefore remains restricted to internal authorised users.

## Explicit exclusions

This feature does not include:

- employee deletion;
- bulk import or CSV upload;
- employee invitations or application accounts;
- profile linking;
- skills or qualifications;
- availability management;
- leave management;
- roster assignments;
- period-specific employee roster goals;
- optimiser integration;
- employee photos or documents;
- payroll;
- wages or hourly rates;
- overtime pay calculations;
- allowances;
- penalty rates;
- awards or enterprise agreements;
- labour-cost optimisation;
- audit-history screens;
- employee self-service;
- mobile-specific screens;
- pagination;
- bulk employee actions.

## Implementation plan

The feature is released in two controlled stages because the hosted database policies must exist before the Vercel application can successfully access employees.

### Stage A — Employee database access

1. Create a database migration for employee constraints, privileges, role helper, RLS policies, and indexes.
2. Add pgTAP tests for permissions, tenant isolation, validation, deletion denial, and active status.
3. Regenerate Supabase TypeScript types.
4. Run local reset, database tests, lint, schema-drift checks, Next.js lint, and build.
5. Review and merge the database PR.
6. Apply the reviewed migration to hosted Supabase.
7. Confirm local and remote migration histories match.

Stage A is independently reviewed, merged, deployed to hosted Supabase, and its
remote migration history has been verified.

### Stage B — Employee application

1. Create server-only employee query and validation modules.
2. Add independently authorised employee Server Actions.
3. Add `/app/employees`.
4. Add `/app/employees/new`.
5. Add `/app/employees/[employeeId]/edit`.
6. Add status search and filters.
7. Add create and edit forms.
8. Add deactivate/reactivate confirmation flow.
9. Convert the Employees navigation placeholder into a real link.
10. Test all roles locally.
11. Test Preview read-only behaviour.
12. Review, merge, and verify Production.

Items 1–11 are implemented and validated locally. The application security
review and repository validation are complete locally. Stage B is committed
locally, independently reviewed, and product-owner UI tested. Push, pull
request, CI, hosted Preview validation, merge, and Production verification
remain pending.

## Implementation notes

Stage A and the local Stage B application are implemented. Stage B adds no
database migration and does not change the approved Stage A RLS, grants, or
business rules.

- Migration and policy design:
  - `public.employees` keeps RLS enabled.
  - Active organisation members may select active and inactive employees only
    inside organisations where they hold an active membership.
  - Active Owners, Admins, and Managers may insert and update employees inside
    their organisation. Scheduler and Viewer writes are denied by RLS.
  - There is no authenticated `DELETE` grant and no employee `DELETE` policy.
  - Authenticated insert and update privileges are column-specific. Record IDs,
    profile linkage, creation timestamps, and update timestamps cannot be
    supplied directly. Organisation ID is required for insert so the future
    trusted Server Action can apply its derived scope, but it cannot be updated.
  - The existing private active-membership and role helpers are used by the
    policies. The role helper validates the requested role names and reads the
    caller identity from `auth.uid()`.
- Database validation and normalisation:
  - A private trigger trims employee names, collapses repeated whitespace,
    trims codes, converts codes to uppercase, and converts blank codes to null.
  - Constraints enforce name and code lengths, the employee-code character set,
    non-negative ordered hours, quarter-hour increments, the 168-hour maximum,
    and the 2,000-character notes limit.
  - A partial expression index enforces case-insensitive employee-code
    uniqueness per organisation. Separate indexes support organisation/status
    and organisation/name access paths.
  - The existing employee `updated_at` trigger remains responsible for all row
    update timestamps.
- Tests:
  - A dedicated 68-assertion pgTAP file covers grants, policy shape, all roles,
    inactive and suspended membership, authenticated non-member reads and
    writes, anonymous access, cross-organisation reads and writes,
    normalisation, database validation, immutable fields,
    deactivation/reactivation, relationship preservation, and deletion denial.
  - The earlier organisation access-control suite now recognises employee read
    access as an implemented feature while retaining denial checks for the
    remaining operational tables.
- Generated types:
  - Supabase TypeScript types were regenerated from the rebuilt local database.
    Policy, constraint, trigger, and index changes do not alter the public row
    shape, so the generated file has no diff.
- Stage B server data flow:
  - Server Components resolve authentication and the active organisation through
    the existing organisation context, then pass only the trusted organisation ID
    to the `server-only` employee data layer.
  - Employee reads use a fresh authenticated server Supabase client, explicit
    `organisation_id` filters, narrow UI-specific column selections, and RLS as
    the final boundary. No service role or secret credential is used.
  - List parameters are normalised to `active`, `inactive`, or `all`; the default
    is active. Search is bounded to 100 Unicode characters.
  - Search uses independent parameterised `ilike` queries for name and code.
    Backslash, percent, and underscore are escaped as literal LIKE input; results
    are deduplicated by employee ID and sorted by full name.
- Stage B validation:
  - One dependency-free production validator is shared by create and edit.
  - It normalises names and codes and validates approved enums, Unicode-aware
    lengths, non-negative quarter-hour values, hour ordering, the 168-hour
    maximum, and notes length. Safe field-specific errors are returned.
  - Node 24 tests import the production filter and validation modules directly;
    there is no parallel test implementation or added test dependency.
- Stage B mutations:
  - Create, update, deactivate, and reactivate are Server Actions. Every exported
    action first calls `assertMutationsAllowed()`, then independently resolves
    authentication, active membership, and an Owner/Admin/Manager role.
  - Organisation scope is always derived server-side. Existing employee IDs are
    organisation-scoped lookups before a mutation and again in the update query.
  - Expected uniqueness, constraint, RLS, and general failures are mapped to safe
    messages; raw database errors are not returned.
  - Successful changes revalidate employee routes. There is no delete action.
- Stage B routes and interface:
  - `/app/employees` is a server-rendered, URL-filtered register with responsive
    rows, human-readable labels, empty states, and active employees by default.
  - `/app/employees/new` and `/app/employees/[employeeId]/edit` render the shared
    `useActionState` form for permitted roles. Read-only roles are redirected
    safely and cross-organisation identifiers receive the same generic 404 as
    any unavailable employee.
  - A focused Client Component uses native browser confirmation for deactivate
    and reactivate; deactivation wording states that the record and history are
    retained and the employee leaves the Active list.
  - The shared create/edit form intercepts hydrated submissions and dispatches
    its Server Action in a React transition. This avoids React 19's automatic
    reset of uncontrolled fields when an expected validation or safe database
    error is returned, while successful mutations retain their redirects.
  - The authenticated shell now links to Employees while preserving organisation,
    signed-in identity, role, timezone, and sign-out information.
  - The document canvas uses the same neutral light background as the application
    content. Root-level horizontal overscroll containment prevents a Mac trackpad
    boundary swipe from exposing a conflicting dark template canvas without
    suppressing vertical scrolling or concealing genuine overflow.
- Preview safety:
  - Lists, filters, and forms may render for review. Write buttons are disabled
    and a read-only notice is shown when mutations are unavailable.
  - Every direct Server Action call is also blocked by the existing server-side
    mutation guard. Production still requires `APP_MUTATIONS_ENABLED=true`.
- There are no deviations from the approved Stage B rules.

## Files changed

- `supabase/migrations/20260808000000_add_employee_database_access.sql`
  - Employee normalisation, constraints, indexes, least-privilege grants, role
    helper access, and organisation-scoped RLS policies.
- `supabase/tests/database/employee_database_access.test.sql`
  - Stage A pgTAP access-control and business-rule coverage.
- `supabase/tests/database/organisation_access_control.test.sql`
  - Updates prior privilege expectations now that employee reads and the role
    helper are intentionally enabled.
- `docs/features/employees.md`
  - Records the actual Stage A and Stage B design, evidence, limitations, and
    review guide.
- `.github/workflows/ci.yml`
  - Runs the dependency-free production filter/validation tests in CI.
- `package.json`
  - Adds the `test:web` Node 24 test command.
- `apps/web/src/app/app/application-shell.tsx`
  - Shared authenticated application shell and functional Employees navigation.
- `apps/web/src/app/globals.css`
  - Light document-canvas background and horizontal boundary-overscroll
    containment for the application viewport.
- `apps/web/src/app/app/page.tsx`
  - Uses the shared application shell without changing dashboard behaviour.
- `apps/web/src/app/app/employees/actions.ts`
  - Independently guarded create, update, deactivate, and reactivate actions.
- `apps/web/src/app/app/employees/page.tsx`
  - Organisation-scoped register, search, status filter, role controls, and
    responsive list.
- `apps/web/src/app/app/employees/new/page.tsx`
  - Protected create route.
- `apps/web/src/app/app/employees/[employeeId]/edit/page.tsx`
  - Protected organisation-scoped edit route.
- `apps/web/src/app/app/employees/employee-form.tsx`
  - Shared create/edit form with pending and field-error feedback.
- `apps/web/src/app/app/employees/employee-status-action.tsx`
  - Native confirmation and guarded status submissions.
- `apps/web/src/app/app/employees/error.tsx`
  - Safe employee-route error boundary.
- `apps/web/src/app/app/employees/not-found.tsx`
  - Generic tenant-safe unavailable-employee response.
- `apps/web/src/lib/employees/data.ts`
  - Server-only, narrow, explicitly organisation-filtered employee reads.
- `apps/web/src/lib/employees/filters.ts`
  - Untrusted URL normalisation, literal LIKE escaping, deduplication, and sorting.
- `apps/web/src/lib/employees/filters.test.mjs`
  - Production filter tests for empty, wildcard, status, duplicate, and sorting
    behaviour.
- `apps/web/src/lib/employees/model.ts`
  - Employee DTOs, defaults, labels, formatting, and management-role helper.
- `apps/web/src/lib/employees/validation.ts`
  - Shared production employee validation.
- `apps/web/src/lib/employees/validation.test.mjs`
  - Direct production-validator tests.

`apps/web/src/types/database.types.ts` was regenerated and verified current but
did not change because Stage A does not change the public table or enum shape.

## Test matrix

| Area | Scenario | Expected result | Result |
| --- | --- | --- | --- |
| Authentication | Anonymous opens Employees | Redirect to login or access denied | Pass — local HTTP and pgTAP |
| Membership | Authenticated user without organisation opens Employees | Redirect to onboarding | Pass — local HTTP and pgTAP |
| Read access | Owner reads own organisation employees | Allowed | Pass — local HTTP and pgTAP |
| Read access | Admin reads own organisation employees | Allowed | Pass — local HTTP and pgTAP |
| Read access | Manager reads own organisation employees | Allowed | Pass — local HTTP and pgTAP |
| Read access | Scheduler reads own organisation employees | Allowed | Pass — local HTTP and pgTAP |
| Read access | Viewer reads own organisation employees | Allowed | Pass — local HTTP and pgTAP |
| Isolation | User reads another organisation's employee | No row returned | Pass — pgTAP |
| Create | Owner creates employee | Employee created in own organisation | Pass — pgTAP |
| Create | Admin creates employee | Employee created in own organisation | Pass — pgTAP |
| Create | Manager creates employee | Employee created in own organisation | Pass — pgTAP |
| Create | Scheduler creates employee | Denied | Pass — pgTAP |
| Create | Viewer creates employee | Denied | Pass — pgTAP |
| Validation | Missing or invalid full name | Field error | Pass — Node production-module tests and database |
| Validation | Invalid employee code | Field error | Pass — Node production-module tests and database |
| Validation | Duplicate code in same organisation | Rejected | Pass — pgTAP |
| Validation | Same code in another organisation | Allowed | Pass — pgTAP |
| Validation | Invalid hour ordering | Rejected by app and database | Pass — local action, Node tests, and pgTAP |
| Validation | Maximum allowed hours above 168 | Rejected | Pass — Node tests and pgTAP |
| Update | Manager edits own organisation employee | Allowed | Pass — role UI, local Owner action, and pgTAP |
| Update | User edits another organisation employee | Denied without existence disclosure | Pass — local generic 404 and pgTAP |
| Ownership | User attempts to change organisation ID | Denied | Pass — pgTAP |
| Profile | User attempts to change profile ID | Denied | Pass — pgTAP privilege check |
| Status | Manager deactivates employee | Employee retained and marked inactive | Pass — local action and pgTAP |
| Status | Manager reactivates employee | Employee marked active | Pass — local action and pgTAP |
| Delete | Any authenticated role deletes employee | Denied | Pass — pgTAP |
| List | Default list | Active employees only | Pass — local HTTP |
| List | Inactive filter | Inactive employees shown | Pass — local HTTP |
| List | All filter | Active and inactive shown | Pass — local HTTP |
| Search | Search by full name | Matching employees shown | Pass — local HTTP and Node tests |
| Search | Search by code | Matching employees shown | Pass — local HTTP and Node tests |
| Preview | Preview attempts create or edit | Rejected server-side | Pass — local Preview simulation and direct action call |
| Navigation | Employees navigation selected | Employee list opens | Pass — local HTTP and code review |
| CI | pgTAP suite | All tests pass | Pass — 111 assertions across 2 files |
| CI | Production filter/validation tests | All tests pass | Pass — 12 assertions |
| CI | Generated database types | No generated diff | Pass — no diff |
| CI | Next.js lint and build | Pass | Pass |

## Manual validation

- Environment: local Supabase CLI stack in Docker and the repository's pinned
  npm/Node toolchain. No hosted project was mutated and no environment values
  were printed.
- Accounts and roles: deterministic pgTAP fixtures exercised Owner, Admin,
  Manager, Scheduler, Viewer, suspended Manager, authenticated non-member, a
  second-organisation Owner, and the anonymous database role.
- Database outcomes: allowed reads, creates, edits, deactivation, and
  reactivation passed. Read-only role writes, suspended/non-member access,
  anonymous access, cross-organisation access, ownership changes, and deletes
  were denied. Deactivation retained both the employee and a dependent skill
  relationship.
- Stage B local application verification used temporary local-only users,
  organisations, memberships, and employees. The harness exercised 14 complete
  request-path scenarios and removed all temporary fixtures afterward.
- Application outcomes: unauthenticated and no-organisation redirects passed;
  Owner, Admin, Manager, Scheduler, and Viewer list access passed; Scheduler and
  Viewer controls and routes remained read-only; a direct Scheduler create
  action was rejected; create and edit stored normalised values; duplicate code
  and invalid-hour feedback were safe; and a cross-tenant employee ID returned
  a generic 404.
- List outcomes: active was the default; inactive and all URL filters worked;
  deactivate moved the retained record into Inactive; reactivate restored it;
  refreshed search/filter URLs preserved state; literal percent and underscore
  searches worked through Supabase; and a name/code duplicate rendered once.
- Preview outcomes: a local `VERCEL_ENV=preview` production-build simulation
  rendered the form and read-only notice with disabled controls. Replaying its
  Server Action form directly returned the mutation-guard error and a database
  check confirmed no employee was inserted.
- Native confirmation wording and accessible form behavior were verified by code
  review. Browser automation is not installed in this repository, so the visual
  browser prompt itself was not clicked programmatically.
- Initial Stage A validation on 8 August 2026:
  - `npx supabase db reset --local` — passed.
  - `npx supabase gen types typescript --local` — regenerated output matches the
    checked-in type file.
- Independent-review correction validation on 9 August 2026:
  - `npx supabase test db` — passed, 111 assertions across 2 files.
  - `npx supabase db lint --local --fail-on error` — passed with no errors.
  - `npx supabase db diff --local --schema public,private` — passed with no
    schema changes.
  - `npm run lint:web` — passed.
  - `npm run build:web` — passed.
  - `git diff --check` — passed.
- Stage B validation on 9 August 2026:
  - `npm run test:web` — passed, 12 production-module assertions.
  - local authenticated application verification — passed, 14 scenarios.
  - `npx supabase test db` — passed, 111 assertions across 2 files.
  - `npx supabase db lint --local --fail-on error` — passed with no schema
    errors.
  - `npm run lint:web` — passed.
  - `npm run build:web` — passed on Next.js 16.2.9; all employee routes compiled.
  - `git diff --check` — passed.
  - Review against `origin/main` — passed after checking authentication,
    authorisation, tenant isolation, action exposure, untrusted parameters,
    organisation IDs, cross-tenant IDs, safe errors, Preview bypass, role-aware
    controls, DELETE absence, and server/client data boundaries.
- Product-owner manual UI test:
  - The product owner completed local manual UI testing of Stage B and reported
    it passed.
- Final independent-review correction validation on 13 August 2026:
  - Invalid hour ordering, invalid employee code, and a duplicate employee code
    retained every other entered value after field-specific or safe database
    feedback.
  - Correcting each error and resubmitting completed successfully for the shared
    create/edit form flow.
  - `npm run test:web` — passed, 12 production-module assertions.
  - `npx supabase test db` — passed, 111 assertions across 2 files.
  - `npx supabase db lint --local --fail-on error` — passed with no schema
    errors.
  - `npm run lint:web` — passed.
  - `npm run build:web` — passed on Next.js 16.2.9; all employee routes
    compiled.
  - `git diff --check` — passed.
- Root horizontal-overscroll correction validation on 13 August 2026:
  - Chrome browser inspection at 375, 768, 1,024, 1,280, 1,440, 1,536, and
    1,728 CSS pixels found equal document client and scroll widths with zero
    horizontal scroll at rest.
  - The light document canvas remained explicit when dark colour preference was
    emulated, and a synthetic horizontal boundary gesture did not change the
    document scroll position.
  - The sidebar, filters, Add employee control, employee cards/table, and row
    actions remained usable at their responsive breakpoints.
  - `npm run test:web`, `npm run lint:web`, `npm run build:web`, and
    `git diff --check` — passed.

## Known limitations

1. Stage B is implemented, committed locally, validated locally, independently
   reviewed, and product-owner UI tested. Push, pull request, hosted CI and
   Preview validation, merge, and Production verification remain pending.

2. No pagination is included. The employee list is suitable for the initial organisation scale and should gain pagination before supporting very large workforces.

3. Preview and Production currently use the same hosted Supabase project. Preview is protected from application mutations but may display production data allowed by RLS to the signed-in user.

4. Employee notes are visible to all active organisation roles and must therefore remain operational and non-sensitive.

5. Employee deactivation does not automatically repair or remove future roster assignments. That behaviour belongs to roster management.

6. The default hour fields are treated as weekly planning values. Period-specific goals will be handled through `employee_roster_goals`.

7. There is no application audit-history interface beyond existing creation and update timestamps.

8. The local verification exercised role-aware rendering for all five roles and
   direct action rejection for Scheduler. The existing Stage A pgTAP suite is the
   automated final-boundary evidence for every role's write permissions.

## Approved decisions

The `Rules approved` status covers these decisions:

1. Manager may create, edit, deactivate, and reactivate employees.
2. Scheduler and Viewer are read-only.
3. Employee code is optional, uppercase, and case-insensitively unique within an organisation.
4. Default planning hours are weekly values.
5. Additional-hours preference is the user-facing label for the existing overtime-preference enum.
6. Notes are visible to all active organisation roles and restricted to non-sensitive operational information.
7. Employee Management will be delivered as two PRs: database access first, application second.
8. Pagination is postponed.

## Plain-English explanation

Stage A establishes the protected database contract and Stage B supplies the
employee pages, forms, and guarded application operations.

The database now accepts valid employee records only, normalises names and
codes, and retains deactivated employees instead of deleting them. It permits
all active organisation roles to read their own organisation's employees while
restricting database writes to active Owners, Administrators, and Managers.
Cross-organisation access and permanent deletion are denied.

Employee Management is the organisation's master list of people who can later
be placed on rosters. The register opens with active employees and can be
searched by name or code or filtered to inactive and all employees.

Managers record each employee's name, optional code, employment type, preferred
weekly hours, maximum allowed hours, and preference for additional hours.
Employees can be deactivated without destroying their record or history and
reactivated later.

Every database request is restricted to the signed-in user's organisation. Owners, Administrators, and Managers can maintain employee records. Schedulers and Viewers can see the employee register but cannot change it.

This feature stores planning information only. It does not calculate wages, legal overtime, penalties, allowances, or payroll.

## Code-reading guide

Review Employee Management in this order:

1. `docs/features/employees.md`
   - approved business rules and acceptance criteria.

2. `supabase/migrations/20260808000000_add_employee_database_access.sql`
   - constraints, indexes, privileges, and RLS policies.

3. `supabase/tests/database/employee_database_access.test.sql`
   - evidence that permissions and tenant isolation work.

4. `apps/web/src/types/database.types.ts`
   - generated database contract used by TypeScript; regenerated with no diff.

5. `apps/web/src/lib/employees/data.ts` and `filters.ts`
   - how organisation-scoped employee data, literal search, URL normalisation,
     deduplication, and sorting work.

6. `apps/web/src/lib/employees/validation.ts` and production-module tests
   - how names, codes, hours, preferences, and notes are validated.

7. `apps/web/src/app/app/employees/actions.ts`
   - authentication, role checks, mutation guard, and database mutations.

8. `apps/web/src/app/app/employees/page.tsx`
   - employee list, search, filters, permissions, and empty state.

9. Employee form routes, `employee-form.tsx`, and
   `employee-status-action.tsx`
   - create/edit feedback, defaults, Preview controls, and native status
     confirmation.

10. `apps/web/src/app/app/application-shell.tsx`
    - how users reach Employee Management while retaining application identity
      and sign-out context.
