# Prompt 05 — Secure access and first-login flow

Continue the Coach Michel project from the current delivery branch, not from a new scaffold. Read docs/delivery/START_HERE.md and STATUS.json, inspect git status, and read the preceding stage evidence. The original verified baseline is aeadf539ba1f793c09117837ad975753d2e88ef1 (tree 167d224d0fbbb8d38b8146fe32f85a4c6cc577c4), repository tatiana-nazz/coach-michel-website-2. Preserve unrelated work and historical evidence. The owner delegated routine implementation/design choices and asked for autonomous progress to a final website. Do the work, verify it, commit a reviewable checkpoint and continue to the next ready stage. Ask only for an actual missing credential, owner fact, cost approval or protected action. Do not claim unavailable evidence or fabricate approvals/data.

## Work

Implement /access, /access/provisioning, /access/notices and /access/recovery. Keep invitation-only accounts. Connect password login, server-verified session refresh, logout, recovery and callback handling to Supabase. Redirect by server-derived role and current grants; handle revoked, expired and suspended identities. Provisioning is permission-gated and never grants roles from user-editable metadata. Require explicit versioned notice acceptance where applicable. Validate request shape, origin, body bounds and stable error response; avoid account enumeration. Configure allowed redirects.

## Acceptance

Valid and invalid sign-in, sign-out, expired session, forbidden role, first-login accept/decline, recovery and invitation flows are tested. No open signup or privilege self-assignment exists. Credentials stay out of Git/logs. If a real bootstrap owner identity is absent, prepare setup and request exactly that identity.

## Required result

Update STATUS.json with source commit, changed files, checks actually run, evidence paths, unresolved inputs and next step. Summarize the outcome plainly. A failed or blocked check stays visible. Continue automatically where possible.
