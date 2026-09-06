# Private-page browser presentation fixtures

These synthetic records are used only by `scripts/verify-private.mjs`. They do not create users, alter the database, seed production data, or bypass application guards in deployed code.

The standalone script starts the actual production Next.js build with a fake provider **inside the test process only**. Its fetch adapter intercepts the exact configured Supabase host and never forwards provider calls. Other outbound server fetches are blocked. Browser requests are restricted to localhost.

The synthetic session and grants exist solely to render the private layouts. This suite checks route rendering, one primary heading, responsive overflow, document direction, browser errors, solid enabled control contrast, and screenshot presentation. It does **not** establish that authentication, grants, RLS, mutations, persistence, or live user workflows work. Those require separate database and integration tests.

Every saved screenshot carries a visible fixture banner. No fixture is imported by application code.

Run after a successful production build:

```sh
CMH_CHROMIUM_MODULE=/absolute/path/to/chromium/build/index.js \
CMH_PRIVATE_EVIDENCE_DIR=/absolute/path/to/evidence \
node scripts/verify-private.mjs
```

The optional Chromium module supports environments without a downloaded Playwright browser. Omit it when Playwright Chromium is installed normally. The script reads the configured provider URL from `.env.local` only to identify the exact host to intercept; it does not print credential values.

To repeat a focused set after a presentation fix, set `CMH_PRIVATE_ROUTES` to comma-separated exact routes, for example `/trainee/sessions/fixture-schedule/sequence,/coach,/ops/incidents`. Use a separate evidence directory to preserve the preceding full-run report.

The adapter implements the read-only `cmh_permission_checks` RPC with an explicit allowlist of synthetic capability/resource pairs for the coach fixture. This lets the actual authoring controls render without relying on production permissions. Unexpected provider methods, tables, or endpoints are recorded and fail the suite even when an application error boundary catches the request failure. No mutation RPC is implemented. Authoring checks explicitly assert the form controls are visible; a friendly permissions-unavailable state does not pass.
