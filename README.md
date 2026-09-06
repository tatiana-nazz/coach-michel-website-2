# Coach Michel

An English/Arabic coaching website with an integrated private training application. This delivery branch includes the public site, access lifecycle, eight trainee screens, ten coach screens, four operations screens, and scoped API/database workflows. **Live deployment and real account acceptance remain pending.** Local builds and synthetic tests do not establish final production readiness.

Read [the delivery starting point](docs/delivery/START_HERE.md), [Checkpoint 02](docs/delivery/CHECKPOINT_02.md), and [current status](docs/delivery/STATUS.json) before continuing. The historical baseline commit is `aeadf539ba1f793c09117837ad975753d2e88ef1`; its evidence is preserved. The twelve delivery prompts are work packages that the delivery agent manages; the owner does not need to run each manually.

## Local setup

Use Node **24.18.0** for reproducibility and pnpm **11.21.0**. `package.json` permits compatible Node 24 patches for managed hosting. Install pinned dependencies with `pnpm install --frozen-lockfile`, copy `.env.example` to `.env.local`, and configure the existing Supabase project URL and publishable key. Environment files are ignored by Git. Run `pnpm dev` and open `http://localhost:3000`.

For production mode, run `pnpm build` followed by `pnpm start`. Optional `CMH_APP_ORIGIN` sets the exact trusted public origin for mutation and callback handling; leave it unset for rotating previews unless their stable origin is configured correctly. See the [deployment runbook](docs/delivery/DEPLOYMENT_RUNBOOK.md).

## Application routes

| Area             | Entry points                                                                                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Public           | `/`, `/about`, `/guidance`, `/disclosures`, `/next-steps`                                                                                                                            |
| Access           | `/access`, `/access/provisioning`, `/access/recovery`, `/access/notices`, `/access/password`                                                                                         |
| Role destination | `/workspace` derives access from current database grants                                                                                                                             |
| Trainee          | `/trainee/today`, `/trainee/sessions`, `/trainee/account`, `/trainee/support` and scoped session/completion routes                                                                   |
| Coach            | `/coach`, `/coach/trainees`, `/coach/programs-sessions`, `/coach/exercises`, `/coach/schedule-release`, `/coach/completions`, `/coach/admin` and scoped detail/reconciliation routes |
| Operations       | `/ops/incidents`, scoped recovery/validation routes, and reconciliation handoffs                                                                                                     |

Private pages require a verified session and current application permissions. Training additionally enforces effective notice acceptance. No public self-registration or metadata-derived administrator role is implemented.

The dispatcher preserves the original API operation paths. Requests for JSON use explicit content negotiation where a path also serves a page. The inventory contains 56 preserved production operations, a separate login operation, and four delivery additions for disclosure/policy draft creation and revision. See [SURFACE_MATRIX.json](docs/delivery/SURFACE_MATRIX.json); the 61-entry count excludes supporting callback/logout/password/language handlers.

## Verification

Run `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, and `pnpm test`. Install Playwright Chromium with `pnpm exec playwright install chromium` before the conventional `pnpm test:e2e` suite.

After a production build, `node scripts/verify-public.mjs` starts a local server on port 3100 and records public layout and interaction evidence. `node scripts/verify-private.mjs` runs private presentation checks on port 3101 using an isolated synthetic provider. That private runner intercepts provider traffic and blocks unrelated browser traffic; it is not a live Auth, RLS, or persistence test.

`CMH_CHROMIUM_MODULE` can point to an installed compatible Chromium provider. `CMH_BROWSER_EVIDENCE_DIR` selects public evidence output; `CMH_PRIVATE_EVIDENCE_DIR` selects private output. Public interaction-only retries use `CMH_INTERACTIONS_ONLY=1` with an existing public report.

`tests/db/runtime.test.mjs` applies the migrations to an isolated PGlite database with synthetic Auth scaffolding and tests authorization/command behavior. Set `CMH_PGLITE_MODULE` to an installed `@electric-sql/pglite` module entry, then run `node tests/db/runtime.test.mjs`. These tests do not apply migrations or create users in the connected Supabase project. Final observed counts and limitations belong in [Checkpoint 02](docs/delivery/CHECKPOINT_02.md).

## Data and release

The repository now contains seven migrations, including `20260906173948_runtime_authorization_and_atomic_commands.sql`. The new migration implements scoped runtime authorization, atomic commands, notice gates, authoring/approval support, and audit controls. The connected project now has seven verified migration entries and 40 public tables, all with RLS enabled. The applied runtime migration SHA256 is recorded in Checkpoint 02; do not replay historical migrations blindly.

The Checkpoint 01 remote inspection found 39 public tables, six migration entries, and no accounts or approved content versions. That is a dated observation, not a statement about later remote changes. Synthetic training data stays in isolated fixtures. The latest remote check still found zero real accounts, principals, grants, trainees, and content versions. Real invitations, grants, notices, content, and release configuration must be established and verified before claiming a finished live application. Follow [owner setup](docs/delivery/OWNER_SETUP.md) and the [deployment runbook](docs/delivery/DEPLOYMENT_RUNBOOK.md).
