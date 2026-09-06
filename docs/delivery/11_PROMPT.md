# Prompt 11 — Security and end-to-end release verification

Continue the Coach Michel project from the current delivery branch, not from a new scaffold. Read docs/delivery/START_HERE.md and STATUS.json, inspect git status, and read the preceding stage evidence. The original verified baseline is aeadf539ba1f793c09117837ad975753d2e88ef1 (tree 167d224d0fbbb8d38b8146fe32f85a4c6cc577c4), repository tatiana-nazz/coach-michel-website-2. Preserve unrelated work and historical evidence. The owner delegated routine implementation/design choices and asked for autonomous progress to a final website. Do the work, verify it, commit a reviewable checkpoint and continue to the next ready stage. Ask only for an actual missing credential, owner fact, cost approval or protected action. Do not claim unavailable evidence or fabricate approvals/data.

## Work

Run full pinned quality carrier and production build. Add end-to-end role journeys against isolated known fixture accounts/data, not private customer records. Verify server-side authorization, RLS, object scope, expired/revoked grants, first-login gates, origin checks, validation, rate limiting, idempotency, transaction races and stable errors. Check dependency advisories and secret exposure. Inspect browser console/network and actual persisted outcomes. Reconcile all 56 operations and 31 screens against the audit matrix. Fix P0/P1 defects before release.

## Acceptance

Every critical workflow passes with evidence on an exact source commit. No stub/inert UI/fake API success substitutes for production behavior. Release report explicitly lists any limitations and owner-controlled inputs. Passing component tests alone does not establish whole-app readiness.

## Required result

Update STATUS.json with source commit, changed files, checks actually run, evidence paths, unresolved inputs and next step. Summarize the outcome plainly. A failed or blocked check stays visible. Continue automatically where possible.
