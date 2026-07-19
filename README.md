# Instant Roster

Instant Roster builds practical, fair rosters around shift coverage, employee availability, skills, preferred hours, overtime preferences, and employee goals.

## Product principles

- Meet shift coverage and skill requirements.
- Respect employee availability and preferred hours.
- Account for individual overtime preferences.
- Distribute opportunities fairly.
- Measure employee goal achievement as clear percentages.

## Repository

This npm workspace contains the Next.js web application in `apps/web`. GitHub Actions validates changes, and Vercel deploys the web application from GitHub. Supabase provides the central Postgres backend, with Python and Google OR-Tools supporting roster optimisation.

## Local Supabase development

Local Supabase services run in Docker-compatible containers. Docker Desktop or OrbStack must be running.

```bash
npm run supabase:start
npm run supabase:status
npm run supabase:migrations
npm run supabase:stop
```

The local API, database, Studio, and email testing services use the `5532x` port range so they can run alongside another Supabase project using the default ports.

`npm run supabase:reset` rebuilds the local database from migrations and seed data. It is destructive to local database data and should only be run intentionally.

Do not commit values printed by `supabase status`, including local keys and database credentials. Production schema changes require an explicit, reviewed deployment step.
