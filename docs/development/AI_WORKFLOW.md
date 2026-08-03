# AI-assisted development workflow

This is the permanent workflow for developing Instant Roster with AI assistance.
It keeps business decisions ahead of implementation, makes security reviewable,
and gives the project owner an exact, secret-free change set to understand.

The rules in [`AGENTS.md`](../../AGENTS.md) apply throughout this lifecycle.

## Responsibilities

| Participant | Responsibility |
| --- | --- |
| Product owner | Defines and approves business rules, resolves product decisions, explicitly authorises protected operations, and approves merge. |
| ChatGPT reviewer | Helps shape architecture and specifications, performs independent review of the supplied package, and explains the code and business logic. |
| Codex | Inspects the repository, proposes a plan, implements only after approval, validates the work, updates documentation, and reports the exact result. |
| GitHub Actions | Runs the repository's automated verification on pushes and pull requests. |
| Vercel | Creates read-only Preview deployments and the Production deployment from the approved branch. |
| Supabase migrations | Provide the versioned, reviewable mechanism for deploying database changes. |

No participant may place secrets in feature documents, pull requests, logs, or
review packages. Codex must not commit, push, merge, deploy, or mutate a remote
Supabase project without explicit approval.

## Feature lifecycle

### A. Feature definition

The product owner and ChatGPT reviewer create
`docs/features/<feature>.md` from [`_TEMPLATE.md`](../features/_TEMPLATE.md).
They agree the problem, users, roles, business rules, data model, journeys,
acceptance criteria, tenant-isolation requirements, Preview behavior, and
explicit exclusions. Open decisions that can change the implementation must be
resolved. Set the status to `Rules approved` before code is written.

### B. Codex inspection and plan

Codex verifies that the current branch is not `main`, checks `git status`, reads
the feature document and applicable repository guidance, and inspects the
relevant application, migration, test, and CI structure. Codex presents a
concise implementation and validation plan without changing files.

### C. Approval checkpoint

The product owner confirms the business rules and explicitly approves the plan.
If the scope or a material rule changes later, implementation pauses and returns
to this checkpoint.

### D. Database and security implementation

When a feature affects the database and UI, implement the database and security
contract first. Use a new migration; preserve organisation keys and isolation;
apply least-privilege grants and RLS; harden privileged functions; and add pgTAP
coverage for allowed access, denied access, cross-organisation attempts, and
database business rules. Use local Supabase only. Never reset a linked database.

### E. Application implementation

Build the smallest application change that satisfies the approved rules. Every
Server Action independently checks authentication, authorisation, validated
input, trusted organisation context, and mutation policy. Browser input must not
select or assert organisation ownership. Preview mutation guards must fail
closed. Do not add excluded payroll or labour-cost behavior implicitly.

### F. Local testing

Run validation appropriate to the change and record the actual results in the
feature document. The standard handoff checks are:

```bash
npm run lint:web
npm run build:web
git diff --check
```

For database changes, also rebuild and test the local database, run pgTAP, lint
the schema, check migration drift, and verify generated types as CI does. Do not
print values from environment files or Supabase status output in reports.

### G. Codex `/review` against `main`

Codex reviews the complete change against `main`, applying the Code Review Rules
in `AGENTS.md`. Findings are resolved or recorded before packaging. The review
must cover correctness, agreed business rules, tenant isolation, RLS, Server
Actions, Preview mutation protection, secret handling, tests, and migration
safety.

### H. Review-package generation

Update the feature document with what was actually built, including files,
tests, manual validation, limitations, a plain-English explanation, and a
code-reading guide. Because the patch contains committed feature changes only,
the product owner must explicitly approve commits or create them personally
before generating the final package.

Run:

```bash
npm run review:pack -- <feature-slug>
```

This creates a Markdown report and binary-capable patch in `/tmp`. It fetches
`origin/main` without changing source files, refuses prohibited sensitive paths,
and warns about a dirty worktree. The patch is exactly the committed
`origin/main...HEAD` diff; working-tree changes are reported but are not silently
included. Never upload a repository archive, environment file, or ignored local
artifact as a substitute.

### I. Independent review

Give the ChatGPT reviewer both generated files. The reviewer checks the
specification, architecture, business logic, security boundaries, migrations,
tests, and exact patch, then explains important behavior in plain English.
Resolve blocking findings and regenerate the package when the diff changes.

### J. Pull request

Only after independent review and explicit approval, push and open a pull
request using the repository template. The pull request must state the business
outcome and rules, architecture, security model, tests, validation evidence,
deployment considerations, and known limitations. GitHub Actions must pass.

### K. Preview validation

Vercel creates a Preview deployment. Preview remains read-only: validate
rendering, navigation, authentication boundaries, error handling, and read
paths, and confirm attempted mutations are rejected. Do not point Preview at a
mutable production workflow or bypass the mutation guard.

### L. Merge

The product owner reviews the pull request, independent-review findings,
Preview results, and GitHub Actions checks, then explicitly approves merge.
Codex never merges without that approval.

### M. Production verification

After Vercel deploys the merged revision, verify the Production version, commit,
critical read paths, authentication boundaries, and monitoring. Keep the
verification proportionate and avoid unapproved production mutations.

### N. Remote database deployment when a migration exists

A remote migration is a separate, explicitly approved operation performed only
after review and merge. Confirm the target project, migration list, backup and
rollback strategy, compatibility, and operator before applying it. Never run
`db reset --linked`. Application changes that depend on a pending migration must
use a backward-compatible or otherwise explicitly planned rollout so Production
remains safe until the migration is deployed. Verify the migration and relevant
security behavior afterward without exposing credentials.

## Completion standard

A feature is complete only when its approved rules match the implementation,
automated checks pass, the feature document reflects reality, the independent
review is resolved, Preview protections are verified, merge is approved, and
any required production or database verification has been completed.

