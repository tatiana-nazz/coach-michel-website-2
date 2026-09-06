# Coach Michel

A private training platform with an English/Arabic public website. This delivery branch contains a working public presentation and access foundation; the complete private application is still in progress.

Read [the delivery starting point](docs/delivery/START_HERE.md) and [current checkpoint](docs/delivery/CHECKPOINT_01.md) before continuing. The preserved source commit is `aeadf539ba1f793c09117837ad975753d2e88ef1`.

## Local setup

Use Node **24.18.0** and pnpm **11.21.0** (pinned in the repository). Run `pnpm install --frozen-lockfile`. Copy `.env.example` to `.env.local` and fill in the publishable key from the existing Supabase project. Environment files are ignored by Git. Run `pnpm dev`, then open `http://localhost:3000`.

For production mode, run `pnpm build` then `pnpm start`. Public routes are `/`, `/about`, `/guidance`, `/disclosures`, `/next-steps`, `/access`, `/access/provisioning` and `/access/recovery`. The last two provide help; their lifecycle APIs are not implemented yet.

## Verification

Run `pnpm typecheck`, `pnpm lint`, `pnpm format:check` and `pnpm test`. Install the Playwright browser with `pnpm exec playwright install chromium` before browser tests. The conventional suite is `pnpm test:e2e`. For the production public-page matrix, run `pnpm build` then `node scripts/verify-public.mjs`; it starts and closes its own server on port 3100 and writes evidence to `test-results/public-browser/`.

The matrix covers eight routes, six screen widths and both languages. It also checks mobile navigation, mocked sign-in failure and locale switching. These are public checks, not proof that live role-specific product workflows are complete.

The optional `CMH_CHROMIUM_MODULE` environment variable points to an installed compatible Chromium provider when the standard browser download is unavailable. `CMH_BROWSER_EVIDENCE_DIR` changes the evidence directory. `CMH_INTERACTIONS_ONLY=1` reuses that directory's existing report and reruns just its interaction checks.

## Data and release

The existing database has 39 public tables and six historical migrations. It has no user accounts or approved content versions as observed on 6 September 2026. Do not replay migrations or create fictional members to make the UI look populated. A real owner identity and a separately verified role bootstrap are required before private access acceptance. No production deployment has been made by this checkpoint.
