# Checkpoint 01 — public website and foundation

Date: 6 September 2026. Status: **partial delivery; not the final website**.

## Verified source and infrastructure

The complete repository was cloned with the supplied handoff script. Commit `aeadf539ba1f793c09117837ad975753d2e88ef1` and tree `167d224d0fbbb8d38b8146fe32f85a4c6cc577c4` matched exactly. All 44 entries in the handoff SHA256 manifest verified. Work is on `delivery/complete-website-2026-09-06`; the historical branch is preserved.

The historical 42/49 count described components and infrastructure, not an operational site. The baseline had 31 screen component slices, 56 production operation descriptors plus a separate login operation, one temporary QA page and one HTTP handler. `SURFACE_MATRIX.json` records the route and operation inventory without treating registry entries as implemented endpoints.

The existing Supabase project was restored from INACTIVE to ACTIVE_HEALTHY. After stable readiness, all 39 public tables and six migration history entries were present. Auth users, principals, grants, trainee profiles and content versions each had a count of zero. Early empty results during COMING_UP were transient. No schema replay, user creation, grant assignment or fabricated training data was performed.

## Implemented

- Original public presentation in English and Arabic: home, coaching approach, training guide, disclosures overview and next steps. Responsive navigation, RTL layout, cookie-based language switching, authored brand geometry, restrained blue motion and accessible form primitives.
- Member sign-in UI connected to the existing server login boundary. Useful invalid-credential and service-error feedback, password visibility control, validation, loading state and same-origin sign-out. The authenticated workspace explicitly says private session workflows are not ready.
- Invitation and recovery help pages. These are informational; account invitation and recovery lifecycles remain pending.
- Credential request origin/content-type checks and a streamed 16 KiB body limit; validation bounds and generic provider-error responses. API path parameter binding and URL encoding. Unexpected HTML or malformed JSON no longer counts as API success.
- Baseline fixes for 14 TypeScript errors and two stale accessibility token assertions. Existing authorization behavior is preserved; several inherited files were only reformatted to satisfy the repository formatting gate.
- Twelve ordered execution prompts, setup instructions and a factual implementation matrix.

## Validation actually performed

| Check                                             | Result                      | Scope                                                                                        |
| ------------------------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------- |
| Exact Node 24.18.0 / pnpm 11.21.0; frozen install | Pass                        | Pinned dependency/runtime reproducibility                                                    |
| Production build including TypeScript             | Pass                        | Implemented application routes                                                               |
| Vitest                                            | 400 tests in 111 files pass | Existing and new unit, contract, accessibility-token and RTL tests                           |
| ESLint                                            | Pass                        | Repository source and scripts                                                                |
| Public browser layout matrix                      | 96 checks pass              | Eight routes × six widths × English/Arabic; HTTP 200, one h1, no horizontal overflow         |
| Public browser interactions                       | Three pass                  | Mobile navigation, mocked invalid-login response, live locale switch                         |
| Manual screenshot review                          | Pass for inspected captures | English desktop/mobile home, Arabic mobile home and English desktop access                   |
| Live successful account sign-in / role flows      | Not run                     | No real accounts exist                                                                       |
| Conventional Playwright test command              | Not run                     | Browser download unavailable; equivalent public checks used the standalone production runner |
| Production deployment                             | Not performed               | Complete product acceptance still pending                                                    |

The browser environment could not download the standard Playwright Chromium package. A locally installed Chromium provider ran the production server and browser in the same process. Evidence is in `public-browser-report.json`; the delivery pack includes rendered screenshots. Testing exposed a Next route-announcer selector collision and timing errors in the harness, which were fixed. Locale switching exposed an absolute-redirect hostname mismatch; the language endpoint now uses a validated relative Location and passed the interaction retest. These public checks do not certify the private application or complete WCAG conformance.

## Remaining engineering work

Complete the authentication lifecycle: callback and refresh handling, versioned notice acceptance, invitation/recovery execution, real owner bootstrap and role-derived redirects. Implement the 56 production operations and the remaining private page wiring, retaining resource/grant authorization and transaction/concurrency behavior. Add trainee, coach and operations workflows; finish async event/refresh, reconciliation and failure recovery; test database RLS and object-level denial against real isolated fixtures. Resolve page/API path collisions explicitly. Complete content, responsive/Arabic/accessibility review, security, deployment and live smoke testing.

Public copy is an owner-review draft. No biography, credentials, testimonials, client counts, exercise prescriptions or training records were invented. No external dataset was imported: data needs should follow the actual exercise-content model and coach approval workflow. Contact details, legal/controller and retention facts, final domain, and real initial owner identity are still owner-controlled inputs.

## Next action

Ask for the email address of the first real owner/coach administrator. Do not ask for a password in chat or grant privilege based on user-editable auth metadata. Read `OWNER_SETUP.md`, complete Prompt 05, and continue independently with ready engineering tasks; a missing account identity is not a reason to stop unrelated implementation work. Resume using the current delivery branch and status, not the historical scaffold.
