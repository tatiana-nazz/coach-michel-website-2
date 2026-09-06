# Prompt 02 — Runtime and application architecture

Continue the Coach Michel project from the current delivery branch, not from a new scaffold. Read docs/delivery/START_HERE.md and STATUS.json, inspect git status, and read the preceding stage evidence. The original verified baseline is aeadf539ba1f793c09117837ad975753d2e88ef1 (tree 167d224d0fbbb8d38b8146fe32f85a4c6cc577c4), repository tatiana-nazz/coach-michel-website-2. Preserve unrelated work and historical evidence. The owner delegated routine implementation/design choices and asked for autonomous progress to a final website. Do the work, verify it, commit a reviewable checkpoint and continue to the next ready stage. Ask only for an actual missing credential, owner fact, cost approval or protected action. Do not claim unavailable evidence or fabricate approvals/data.

## Work

Install Node 24.18.0 and pnpm 11.21.0; use the frozen lockfile. Run inherited lint, typecheck, unit, contract, accessibility, RTL, browser and build checks, recording failures before edits. Choose Next.js App Router page architecture and server/API boundaries. Resolve collisions such as GET /trainee/today and /coach/trainees serving both pages and accepted JSON contracts using explicit content negotiation/rewrite rules and Vary/Cache-Control, with tests. Add safe path/query serialization to the browser API client; never send literal template braces. Establish locale propagation, application providers, loading/not-found/error boundaries, session refresh and secure environment validation.

## Acceptance

A reproducible baseline runs with exact versions. Page/API collision tests pass. No framework error overlay or hydration error occurs. All new environmental requirements are documented without secrets.

## Required result

Update STATUS.json with source commit, changed files, checks actually run, evidence paths, unresolved inputs and next step. Summarize the outcome plainly. A failed or blocked check stays visible. Continue automatically where possible.
