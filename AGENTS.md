# Instant Roster agent rules

The complete feature lifecycle is documented in
[`docs/development/AI_WORKFLOW.md`](docs/development/AI_WORKFLOW.md).

## Working rules

- Use npm only. Do not use yarn, pnpm, Bun, or another package manager.
- Never modify code directly on `main`. Verify the current branch before editing.
- Never commit, push, merge, or deploy without explicit approval.
- Never run remote Supabase mutations without explicit approval.
- Never run `supabase db reset --linked` or any equivalent linked reset.
- Never expose or print credentials, cookies, passwords, or environment values.
- Read the applicable `docs/features/<feature>.md` and ensure its business rules
  are approved before implementing the feature.
- For features affecting both the database and UI, implement and validate the
  database and security model first.
- Use versioned migrations for every database change.
- Add or update pgTAP tests for RLS, functions, and database business rules.
- Every Server Action must independently validate authentication,
  authorisation, and whether mutation is permitted in the current environment.
- Do not accept organisation ownership identifiers from the browser. Derive
  organisation scope from trusted authenticated server-side context.
- Preserve organisation isolation in schemas, queries, policies, and UI flows.
- Preview deployments remain read-only.
- Do not add wages, payroll, allowances, penalty rates, or labour-cost
  functionality unless explicitly requested.
- Run the repository validation commands before handoff.
- Update the feature document to describe the actual implementation, files,
  tests, limitations, and plain-English behavior.
- Produce a review package before requesting a pull request.

## Code Review Rules

- Tenant isolation: verify every organisation-owned read and write is scoped to
  the authenticated organisation and cannot cross tenant boundaries.
- RLS: verify RLS is enabled, least-privilege grants and policies are explicit,
  privileged functions are hardened, and positive and negative pgTAP cases exist.
- Server Actions: verify each action independently authenticates, authorises,
  validates input, derives organisation scope, and enforces mutation policy.
- Secret handling: reject credentials, cookies, passwords, environment values,
  private keys, temporary Supabase credentials, and secret-bearing artifacts.
- Preview protection: verify every mutation path fails closed in Preview.
- Migration safety: require versioned, reviewable, locally tested migrations;
  never rewrite deployed migration history or reset a linked database.

