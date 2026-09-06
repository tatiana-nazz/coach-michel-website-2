# Coach Michel — website delivery

This delivery track implements the owner's 6 September 2026 request to manage the build autonomously. Start with [Checkpoint 02](CHECKPOINT_02.md), [STATUS.json](STATUS.json), and the [surface matrix](SURFACE_MATRIX.json). The public website and private application are integrated in source. Live deployment, real account acceptance, and final content approval remain pending; this is not a claim that the finished website is live.

The original handoff remains historical evidence. This track does not reconstruct missing App Builder Rev10/Rev4790 records or claim legacy lifecycle approvals.

## Verified starting point

- Repository: `tatiana-nazz/coach-michel-website-2`.
- Historical branch: `p4/bootstrap-greenfield`.
- Baseline commit: `aeadf539ba1f793c09117837ad975753d2e88ef1`.
- Baseline tree: `167d224d0fbbb8d38b8146fe32f85a4c6cc577c4`.
- Delivery branch: `delivery/complete-website-2026-09-06`.
- The complete repository was cloned; commit/tree identities and all 44 handoff manifest entries matched.
- Local reproducibility uses Node 24.18.0 and pnpm 11.21.0. Hosting may use a compatible Node 24 patch as permitted by `package.json`; the dependency lockfile remains pinned.

The transfer's 42/49 described components and infrastructure. At the baseline, 31 presentation slices existed alongside one temporary QA page, one HTTP handler, 56 production operation descriptors, and a separate login operation. That count was not live product readiness.

## Integrated implementation

| Area                                            | Source implementation                                                                                                                                    | Acceptance still required                                                     |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Public website — five screens                   | Original English/Arabic presentation, responsive navigation, RTL, language switching, and public content reads                                           | Approved biography/contact/disclosure content where applicable; hosted review |
| Access — four screens plus supporting endpoints | Sign-in, cookie refresh, invite/recovery callback, password reset, invitation status, current notice decisions, and live-grant workspace routing         | Provider callback/SMTP configuration and real invited accounts                |
| Trainee — eight screens                         | Today, sessions, sequence, exercise guidance, completion submission/state, account, and support/privacy                                                  | Persisted role flows and denial checks on the release environment             |
| Coach — ten screens                             | Scoped trainee views, program/session/exercise authoring, scheduling and release, monitoring, reconciliation, and administration                         | Real data, separate approved actors, and hosted workflow verification         |
| Operations — four screens                       | Incident intake, recovery activity, independent validation, and reconciliation handoff; support/privacy handling is also integrated                      | Real operational permissions and hosted persistence verification              |
| API and database                                | Content-negotiated dispatcher, preserved operation paths, four explicit authoring additions, and a seventh migration with scoped RLS and atomic commands | Real account/workflow acceptance and exact deployed-source verification       |

There are 61 registered operations in the delivery inventory: 56 preserved production operations, the separate login operation, and four delivery additions for creating/revising disclosure and policy drafts. Supporting callback, logout, password, and language handlers are additional HTTP routes and are not part of that registry count. Inventory presence and local tests do not prove every hosted workflow has passed.

## Delivery sequence

The twelve prompts are engineering work packages. The owner does not need to copy or run each prompt manually. Continue from the latest evidence, carry context forward, and fix failures within the relevant package without routine confirmation. Do not replay completed implementation simply because a numbered prompt has not appeared as a chat message.

1. Source, contracts, and implementation audit.
2. Reproducible runtime and application architecture.
3. Luminous design system, assets, and motion.
4. Public website.
5. Authentication, invitations, recovery, and notices.
6. Trainee application and completion lifecycle.
7. Coach application and publishing workflows.
8. Administration, support, operations, and recovery.
9. Data, content, integrations, and deployment configuration.
10. Responsive, Arabic, accessibility, and visual review.
11. End-to-end, security, concurrency, and release verification.
12. Deployment, live smoke tests, and operational handover.

Stage status in `STATUS.json` separates implementation from release acceptance. A stage is complete only when its required evidence exists.

## Product decisions

Retain Next.js, React, TypeScript, the existing Supabase project, invite-only access, and role/capability/resource scopes. HTML navigation and JSON API requests share preserved semantic paths through explicit content negotiation. Administrative authority comes from active database grants, not editable authentication metadata.

The design uses white and ice-blue surfaces, navy typography, electric-blue accents, authored geometry, generous spacing, and restrained motion. The owner's request authorizes a fresh design; no exact fidelity to an unseen reference is claimed. English and Arabic retain correct document direction and mixed-language references.

Do not fabricate biographies, qualifications, results, testimonials, member counts, exercise prescriptions, or trainee activity. Synthetic records belong only to isolated test fixtures. A dataset is optional: import one only when its licensed fields satisfy a concrete product need and its training content can pass coach approval. External records cannot substitute for real member progress.

## Data and evidence boundaries

At Checkpoint 01, the restored Supabase project was ACTIVE_HEALTHY with 39 public tables and six migration history entries; observed users, principals, grants, trainee profiles, and content versions were all zero. Early empty reads during COMING_UP were transient. Those counts describe that inspection, not the current remote schema after any subsequent release work.

Checkpoint 02 adds `20260906173948_runtime_authorization_and_atomic_commands.sql` to source. Its exact bytes were applied and verified remotely: seven migration entries, 40 public tables with RLS enabled on all 40, and zero real accounts, principals, grants, trainees, or content versions. Supabase security advisors returned zero lints. These schema checks do not certify real sign-in or role flows. Local SQL tests use an isolated PGlite database with synthetic Auth scaffolding. Private browser tests run the Next.js application against an isolated synthetic provider. Neither is a live Supabase sign-in, hosted RLS, or production persistence test. Exact final results and the source commit belong in `CHECKPOINT_02.md`.

## Definition of finished

All intended screens must be reachable under correct access controls, and applicable API contracts must pass their workflow acceptance. Mutations must persist with correct pending, authoritative, replay, and concurrency behavior. Cross-user/object denial, revoked grants, notice gates, same-origin mutations, private caching, and role separation must be checked. Mobile, desktop, Arabic, keyboard, and accessibility review must pass. The exact production build and deployed origin must pass live smoke tests.

The owner receives the working URL, verified source commit, setup/runbook, and any unresolved owner-controlled facts. A preview, a populated fixture, or a screen count alone does not meet this definition.

## Next work and owner facts

Finalize integrated evidence and the source commit, configure hosting and callback URLs, and finish live acceptance. The release migration has been applied and verified separately from these remaining tasks. Follow [OWNER_SETUP.md](OWNER_SETUP.md) for the first real principal and [DEPLOYMENT_RUNBOOK.md](DEPLOYMENT_RUNBOOK.md) for hosting.

Resolve owner facts from supplied and connected sources first: the real initial administrator email, approved independent approvers, contact channel, privacy/controller and retention decisions, approved content, and the intended domain. Never infer an identity from Git history or request a password in chat. Missing owner identity does not block independent engineering or fixture verification.

## Continuation protocol

Inspect the delivery branch and Git status, read current evidence and the relevant next prompt, and continue within the owner's existing authorization. Preserve unrelated work and historical evidence. Update status with observed results; do not overwrite an earlier checkpoint to make it appear more complete than it was.
