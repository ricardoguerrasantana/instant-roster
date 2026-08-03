## Business outcome

<!-- What user or business result does this change deliver? -->

## Business rules

<!-- Link the approved feature document and summarise the rules implemented. -->

## Architecture and data flow

<!-- Explain trusted inputs, boundaries, main flow, and important decisions. -->

## Database and migrations

<!-- List migrations and compatibility/deployment needs, or state "None". -->

## Security and RLS

<!-- Cover authentication, authorisation, tenant isolation, RLS, functions,
Server Actions, secret handling, and Preview mutation protection. -->

## User interface

<!-- Describe visible changes, states, validation, accessibility, and errors. -->

## Tests

<!-- List automated coverage and results, including negative security cases. -->

## Manual validation

<!-- Record what was checked locally and the result, without environment values. -->

## Preview validation

<!-- Confirm Preview read paths and that every attempted mutation is rejected. -->

## Production considerations

<!-- Describe rollout order, compatibility, monitoring, rollback, and migrations. -->

## Known limitations

<!-- State accepted limitations and follow-up work. -->

## Reviewer checklist

- [ ] The approved business rules match the implementation.
- [ ] The diff contains no unrelated product scope.
- [ ] Organisation-owned reads and writes preserve tenant isolation.
- [ ] RLS, grants, and privileged functions are least privilege and tested.
- [ ] Every Server Action independently authenticates and authorises the request.
- [ ] Organisation ownership is derived from trusted server-side context.
- [ ] Preview mutation paths fail closed.
- [ ] No secrets, environment values, credentials, or private keys are exposed.
- [ ] Migrations are versioned, safe, locally tested, and deployment-ready.
- [ ] Automated and manual test evidence is sufficient.
- [ ] The feature document explains the actual code and business logic.
- [ ] GitHub Actions and Preview validation have passed.

