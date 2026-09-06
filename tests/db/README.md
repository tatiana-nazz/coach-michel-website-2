# Database runtime verification

`runtime.test.mjs` executes all repository migrations in an isolated PostgreSQL 18.3 WASM database (PGlite 0.5.8). It inserts **synthetic local fixture identities only** and never connects to Supabase. These fixtures are not production seeds.

The migration phase runs as a role with `NOSUPERUSER`, `CREATEROLE` and `BYPASSRLS`, matching the material attributes of hosted Supabase's `postgres` role. PGlite forbids demoting its bootstrap superuser, so the fixture uses a separate migration role. Membership in bootstrap `postgres` is supplied solely for the inherited migration's `ALTER DEFAULT PRIVILEGES FOR ROLE postgres`; the runtime role remains `NOLOGIN`, `NOSUPERUSER`, `NOBYPASSRLS`, and cannot create schema objects. Authenticated clients have no membership in it.

The fixture verifies 30 scenarios across current notice decisions, draft/publication separation, policy-backed scheduling, idempotent release and completion, cross-subject access denial, direct-write forgery denial, correction authorization, support privacy, incident recovery, validator-only handoff, role delegation, zero-grant Auth onboarding, and exact parent-scoped publication. The exact migration hash and scenario names are in `RESULT.json`.

## Reproduce

Use the repository's pinned Node version. Install the isolated test runtime outside the repository, without changing application dependencies:

```bash
npm install --prefix /tmp/cmh-db-check --no-save @electric-sql/pglite@0.5.8
CMH_PGLITE_MODULE=/tmp/cmh-db-check/node_modules/@electric-sql/pglite/dist/index.js \
  node tests/db/runtime.test.mjs
```

A successful run ends with `Verified 30 database scenarios.` This suite is separate from Vitest, because it executes PostgreSQL policies, privileges, triggers and atomic command functions rather than mocked API responses.

## Limits

This validates PostgreSQL semantics locally. It does not validate hosted Supabase Auth email delivery, production user credentials, PostgREST schema cache refresh, TLS, multi-process contention or browser sessions. The advisory lock and unique constraints implement atomic retry control; a multi-session concurrency load test has not been performed. Re-run hosted security advisors after applying the reviewed migration. Keep `cmh_private` outside exposed API schemas.

No tests seed or mutate the restored live project. Live migration application, hosted advisors and deployment are recorded separately by the coordinating delivery workflow.

The runtime migration was created with the Supabase CLI and renamed to the provider-assigned applied version `20260906173948` after the coordinator applied the same reviewed SQL bytes. Its SHA-256 did not change. This keeps local migration history aligned with the hosted database.
