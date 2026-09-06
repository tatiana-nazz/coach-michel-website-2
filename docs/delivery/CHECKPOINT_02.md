# Checkpoint 02 — integrated private application

Status: **implementation checkpoint; final release evidence pending**. This document supersedes Checkpoint 01 as the continuation entry point while preserving that earlier report unchanged. It does not claim that the complete website is live.

## Source identity

| Field                        | Value                                                    |
| ---------------------------- | -------------------------------------------------------- |
| Repository                   | `tatiana-nazz/coach-michel-website-2`                    |
| Delivery branch              | `delivery/complete-website-2026-09-06`                   |
| Preserved baseline commit    | `aeadf539ba1f793c09117837ad975753d2e88ef1`               |
| Preserved baseline tree      | `167d224d0fbbb8d38b8146fe32f85a4c6cc577c4`               |
| Final checkpoint commit/tree | PENDING — record exact verified source after integration |
| Final verification timestamp | PENDING                                                  |

## Integrated behavior

The source now implements all 31 intended screen routes: five public, four access, eight trainee, ten coach, and four operations screens. Supporting password/callback/error and workspace routes complete the navigation. Route presence describes implementation coverage; it does not establish full workflow acceptance.

Access includes provider-verified sign-in and cookie refresh, invite/recovery callbacks, private password setup/reset, invitation status, current notice decisions, and live-grant role routing. Recovery responses do not disclose whether an email has an account. Callback destinations are fixed and same-origin mutation boundaries support the configured deployment origin. Notice acceptance is tied to an effective document version with exact translation evidence; a newer version or later decline cannot be silently accepted. Account and support/privacy access retain their normal authorization when training notices are pending.

Trainee flows cover assigned training, sessions, exercise sequence/guidance, completion submission and durable state, account settings, and support/privacy. Coach flows cover scoped trainee context, program/session/exercise drafts, preview and release, completion monitoring, correction proposals, and administration. Operations flows cover incident intake, recovery activity, independent validation, and reconciliation handoff. Empty, pending, unavailable, and forbidden states are explicit; fixture records are not presented as real member activity.

A server dispatcher resolves HTML/JSON path collisions while preserving operation references and paths. The delivery inventory contains 61 registered operations: 56 preserved production operations, the separate login operation, and four explicit extensions for disclosure/policy draft creation and revision. Extensions are recorded as new delivery contracts rather than invented legacy approvals.

The seventh migration, `20260906173948_runtime_authorization_and_atomic_commands.sql`, adds scoped runtime RLS and atomic command execution, effective notice gates, draft/approval support, replay/conflict handling, and audit controls. It includes separate disclosure approval records. The exact migration bytes were applied and verified in the connected Supabase project. SHA256: `75c0baaef582609f9193c8f3dcf34535e9a0cc839ee04f61714a20db8facfe64`. Remote history has seven entries; all 40 public tables have RLS enabled. `cmh_runtime` has no login, inheritance, superuser, bypass-RLS, or schema-CREATE authority. Anonymous completion reads, client completion inserts, and anonymous/authenticated reads of provider evidence are denied. Security advisors reported zero lints. These are observed schema/security checks, not real account/workflow acceptance.

## Evidence awaiting final integration values

Replace PENDING entries with observed results, the exact command or report path, scope, and the source commit that was tested. Do not carry Checkpoint 01's counts forward as fresh evidence.

| Check                                               | Final result                                                                                                                                | Evidence scope                                                                                                             |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Production build                                    | PASS                                                                                                                                        | Exact integrated application commit                                                                                        |
| TypeScript                                          | PASS as part of production build                                                                                                            | Exact integrated application commit                                                                                        |
| ESLint and formatting                               | ESLint PASS; final repository formatting result pending                                                                                     | Repository source/scripts/docs                                                                                             |
| Unit/contract/accessibility-token/RTL tests         | PASS — 464 tests in 121 files (254 unit tests in 54 files; 210 other tests in 67 files)                                                     | Local automated tests; mocked dependencies identified in tests                                                             |
| SQL authorization and command checks                | PASS — 30 checks against the applied migration bytes                                                                                        | Isolated PGlite/PostgreSQL engine with synthetic Auth scaffolding, not the connected hosted project                        |
| Public browser matrix/interactions                  | PASS — 96 layout checks and three interactions; `public-browser-checkpoint-02.json`                                                         | Local production Next.js/Chromium; invalid-login response may be mocked                                                    |
| Private browser matrix/interactions                 | 88 initial checks plus 24 targeted rechecks; `private-browser-initial-checkpoint-02.json` and `private-browser-followup-checkpoint-02.json` | Local production Next.js/Chromium with synthetic provider fixtures; no real Auth, hosted RLS, or persistence certification |
| Screenshots, keyboard, RTL and accessibility review | PENDING — inspected routes/viewports and unresolved findings                                                                                | Only the captures and checks actually reviewed                                                                             |
| Remote Supabase migration history                   | PASS — runtime migration `20260906173948`; seven history entries and 40/40 public tables with RLS                                           | Connected project's observed state                                                                                         |
| Preview deployment                                  | PENDING — URL, deployment ID, terminal status, commit                                                                                       | Actual provider response and hosted smoke evidence                                                                         |
| Real invitation, login, recovery and role flows     | NOT VERIFIED                                                                                                                                | Requires configured provider and owner-approved identities                                                                 |
| Production release/custom domain                    | NOT ESTABLISHED BY THIS CHECKPOINT                                                                                                          | Requires actual deployment and final hosted acceptance                                                                     |

The historical public checkpoint recorded 400 tests, 96 public layout checks, and three public interactions. Those earlier results remain in `CHECKPOINT_01.md`. The current public report independently records 96 checks and three interactions with no errors. The private initial run identified control-contrast issues; the affected presentation was corrected and the retained targeted recheck report has no errors, console errors, blocked outbound traffic, or solid-control contrast failures. Keep that initial report as history, not proof that the earlier styling passed. Targeted rechecks cover the corrected views, not a second complete 88-check run or a complete accessibility conformance audit.

## Live data and owner setup

Checkpoint 01 observed an ACTIVE_HEALTHY Supabase project with 39 public tables and six historical migrations, and zero Auth users, principals, grants, trainee profiles, and content versions. A separate post-migration remote inspection confirmed seven migrations and 40 RLS-protected public tables, with users, principals, grants, trainee profiles, and content versions still zero. Do not treat synthetic fixtures as real onboarding.

No real initial administrator identity, successful real role login, or delivered invitation is established by this report. A real bootstrap requires the owner-designated identity, explicit grant scopes, and separately approved actors where draft authors cannot approve their own publication or policy. Provider callback/email configuration, approved notices/content, public contact/privacy facts, and the intended domain remain release prerequisites. No external dataset is required to fabricate apparent readiness; any later import must satisfy licensing and coach approval requirements.

An unexecuted, default-dry-run owner grant bootstrap is prepared in `scripts/bootstrap-owner.sql`. It verifies a confirmed existing Auth identity and zero-grant principal, aborts on placeholders or existing administration, and prepares 15 explicitly scoped grants with audit evidence. Grants are persistent by default; an optional future expiry may be supplied. It does not create Auth users or bypass independent approval requirements. See `OWNER_SETUP.md`.

## Next action

Complete final integrated checks and fill the evidence table. Resolve any actual failures. Record the source commit, configure and verify the deployed origin, and complete real account/workflow acceptance using approved identities and isolated test records. Follow `OWNER_SETUP.md` and `DEPLOYMENT_RUNBOOK.md`.

The delivery agent continues the twelve work packages autonomously; the owner does not need to submit each prompt manually. `final_website_ready` remains false until the definition of finished in `START_HERE.md` has evidence.

## Final local verification before preview

Production build, TypeScript, ESLint, and formatting pass. The complete Vitest run passes 464 tests in 121 files. Public browser checks pass 96 render cases and three interactions. Private presentation evidence includes 88 initial checks, 24 targeted corrective rechecks, and 16 authoring checks with 84 visible-control assertions. The authoring fixture explicitly implements the read-only permission RPC; unexpected provider endpoints fail the suite. These browser fixtures never contact the live Supabase project and do not prove live account access or persistence.

Live anonymous REST reads return empty approved-content collections and deny internal provider evidence and completion records. Security advisors have zero findings. Performance advisors separately report unindexed foreign keys, unused indexes, and multiple permissive policies; query tuning remains to be measured against a real workload. See `database-performance-checkpoint-02.json` and the linked remediation references. No production or test user data was inserted into the hosted project.
