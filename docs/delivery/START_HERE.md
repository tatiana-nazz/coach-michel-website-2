# Coach Michel — website delivery

This is a new engineering delivery track authorized by the owner's 6 September 2026 request to manage the entire build autonomously. It preserves the handoff as historical evidence. It does not recreate or extend the missing App Builder Rev10/Rev4790 state or claim legacy lifecycle approvals.

## Verified starting point

- Repository: `tatiana-nazz/coach-michel-website-2`
- Historical branch: `p4/bootstrap-greenfield`
- Commit: `aeadf539ba1f793c09117837ad975753d2e88ef1`
- Tree: `167d224d0fbbb8d38b8146fe32f85a4c6cc577c4`
- Delivery branch: `delivery/complete-website-2026-09-06`
- The entire repository was cloned and both Git identities matched.
- Runtime: Node 24.18.0 / pnpm 11.21.0, installed exactly. Frozen dependency installation succeeded.

## Delivery sequence

The twelve numbered prompts are work packages, not a promise that twelve chat messages guarantee correctness. Execute them in order, carry context forward, fix failures within their stage, and continue without routine confirmation. A stage is complete only when its acceptance evidence exists. Do not replace missing production behavior with demo data or inert controls.

1. Source, contracts and implementation audit.
2. Reproducible runtime and working application architecture.
3. Luminous design system, assets and motion.
4. Public website.
5. Authentication, invitation, recovery and notices.
6. Trainee application and completion lifecycle.
7. Coach application and publishing workflows.
8. Administration, support, operations and recovery.
9. Data, content, integrations and deployment configuration.
10. Responsive, Arabic, accessibility and visual review.
11. End-to-end, security, concurrency and release verification.
12. Deployment, live smoke tests and operational handover.

## Product decisions

- Keep Next.js, React, TypeScript and the existing Supabase project.
- Keep invite-only access and existing role/capability/resource semantics.
- Use existing semantic screen routes. Resolve page/API path collisions explicitly; do not silently change accepted API paths.
- Use luminous white/ice-blue surfaces, deep navy typography, restrained electric-blue/cyan light, distinctive kinetic geometry, generous typography and useful motion.
- The missing reference PNG is not a blocker to a fresh design under the owner's current request. Do not claim exact fidelity to an unseen reference.
- Prefer project-authored vector geometry and rights-cleared assets. No fabricated coach biography, credentials, results, client counts, testimonials or user activity.
- Public educational content must be sourced and separated from coach-approved exercise prescriptions. Import datasets only after checking licensing and fields; external datasets cannot supply real trainee progress.
- Use browser locale controls with complete English/Arabic coverage and RTL layout.

## Definition of finished

All 31 intended screens are reachable with correct access controls and real workflow integration. Every applicable API contract has a tested implementation. Data mutations persist correctly; pending, offline and authoritative outcomes remain distinct. End-to-end role flows pass against an isolated fixture environment. Mobile, tablet, desktop and Arabic rendering are inspected. Security checks include cross-user/object denial, revoked and expired grants, same-origin mutations, server validation, secrets, RLS and replay/concurrency. A production build and live smoke checks pass. The owner receives a working URL, source commit, setup/runbook and an explicit list of any unresolved owner-controlled inputs. A preview or screen count alone is not completion.

## Genuine external inputs

Resolve these from the repository and connected services first. Ask only if still missing after preparing everything else: a real initial owner/coach identity; approved public contact channel; verified biography/brand media if desired; privacy/controller and retention decisions; any chosen paid provider credential or billing approval; final domain access. Never invent these or post credentials to chat/source.

## Observed discrepancies to resolve

The transfer's 42/49 is a historical component/infrastructure count, not live product readiness. The pinned source has one page (temporary QA sign-in), one HTTP handler (session establishment), 56 production operation descriptors plus the separate login operation (57 registered operations total), and 31 presentation component slices. Most production page and API wiring is absent.

The Supabase project was INACTIVE and was restored successfully to ACTIVE_HEALTHY. After stable readiness, 39 public tables and all six migration history entries were visible. There are zero auth users, app principals, grants, trainee profiles or content versions. Early empty schema reads during COMING_UP were transient and are superseded by the healthy-state observation. No migrations were replayed and no user records or grants were invented.

## Current checkpoint

Read `CHECKPOINT_01.md` for the implemented public website and foundation work, verification limits and next actions. This is a partial delivery; `final_website_ready` remains false.

## Continuation protocol

Read this file, `STATUS.json`, the preceding stage evidence and the next numbered prompt. Inspect Git status and branch history. Never overwrite unrelated work or replay completed changes. Update status with factual evidence after each stage. Keep deployment and database changes reversible wherever practical; do not rewrite preserved evidence.
