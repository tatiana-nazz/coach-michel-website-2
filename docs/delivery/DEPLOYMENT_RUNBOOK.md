# Coach Michel deployment runbook

Status checked on 6 September 2026. This file describes a deployable procedure and the remaining provider setup; it does not claim a live deployment.

## Verified hosting context

| Item                            | Observed state                                                  |
| ------------------------------- | --------------------------------------------------------------- |
| Source repository               | `tatiana-nazz/coach-michel-website-2`                           |
| Delivery branch                 | `delivery/complete-website-2026-09-06`                          |
| Application                     | Next.js 16.3.0, React 19.2.8, pnpm 11.21.0                      |
| Local reproducibility version   | Node.js 24.18.0 in `.node-version`                              |
| Connected Vercel team           | `tatiananazz7-5463s-projects` (`team_vyjs0uvAAX1zO1oCqAKEtgps`) |
| Team plan                       | Hobby; no plan change requested or performed                    |
| Existing Vercel projects        | Connected list operation returned an empty list                 |
| Existing local Vercel link      | None at inspection                                              |
| Local Vercel CLI authentication | No token or saved CLI authentication found                      |
| Supabase project                | `szlcakassgylokircuxs`, existing project in `eu-west-1`         |
| Production URL / custom domain  | Not established by this delivery                                |

The connected Vercel tools can inspect teams, projects and deployments. The documented `deploy_to_vercel` operation accepts a source file tree and creates the project if necessary, without requiring CLI authentication. There is no separate environment-variable mutation operation in the exposed connector. The absence of a CLI token is therefore not, by itself, a deployment blocker. The exact deployed write operation still needs to be exercised after the integrated source is verified. See [Vercel MCP tools](https://vercel.com/docs/agent-resources/vercel-mcp/tools#deploy_to_vercel).

Sites was considered as a fallback. It expects Cloudflare Workers-compatible server output; this repository currently produces a normal Next.js Node application. Changing the hosting framework is a separate implementation and validation task, so this runbook retains Vercel as the direct fit.

## Runtime configuration

Set values in the hosting provider's environment-variable settings for both build and runtime. Do not commit values or copy server secrets into `NEXT_PUBLIC_` variables.

| Variable                               | Required | Value / purpose                                                                          |
| -------------------------------------- | -------- | ---------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | Yes      | `https://szlcakassgylokircuxs.supabase.co`                                               |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes      | Current active publishable key from this Supabase project                                |
| `CMH_APP_ORIGIN`                       | Optional | Exact stable HTTPS origin, without trailing slash; leave unset for rotating preview URLs |

The publishable key is intended for public client use. Authorization must still be enforced by the server and database RLS. No service-role or secret key is required by the ordinary application runtime described here. Provisioning privileged identities is a separate owner-controlled administration operation.

Do not copy a production-only `CMH_APP_ORIGIN` into preview: it would reject legitimate preview mutations. When unset, the command boundary validates the request's Origin against the request URL. Login and logout also perform request-origin checks. Test the actual hosted origin after deployment to detect provider/proxy differences.

Vercel selects the Node.js major version and manages minor/patch updates. Keep the local Node pin for reproducibility, but permit a compatible Node 24 range in `package.json` before remote installation. Exact `24.18.0` plus `engine-strict=true` can reject a newer Vercel Node 24 patch. See [supported Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).

## Prepare a preview

1. Finish the integrated application and record the full tested Git commit. Ensure the working tree contains no uncommitted release changes and no environment files are tracked.
2. Prepare the required source files directly from that commit for the connected Vercel deployment operation. Use `{ target: 'preview', name: 'coach-michel-website-2', teamId: 'team_vyjs0uvAAX1zO1oCqAKEtgps', files: [...] }`, where each file has its root-relative path, contents and encoding. Exclude local secrets, generated build output and dependency directories.
3. Allow that operation to create one project named `coach-michel-website-2` in the verified team when none exists. Select Next.js, repository root, Node 24 and the checked-in build configuration. Record the returned project ID; do not invent one. If using a CLI fallback, authenticate with Vercel's secure login flow or an injected `VERCEL_TOKEN`; never request a token in chat.
4. Configure the two Supabase variables for Preview before building. Add Production values when the application is ready for the production target.
5. Deploy a Preview from the verified source. Do not use `--prod` in this stage. Keep any provider deployment protection enabled.
6. Wait for terminal `READY` or `ERROR`, inspect build logs, and record the provider deployment ID, exact URL, full source commit and framework/runtime versions.

For an authenticated CLI, the equivalent preview sequence is:

```bash
vercel link --project coach-michel-website-2 --scope tatiananazz7-5463s-projects --yes
vercel pull --environment=preview --scope tatiananazz7-5463s-projects --yes
vercel build
vercel deploy --prebuilt --scope tatiananazz7-5463s-projects
```

The CLI must already be authenticated. `vercel pull` writes local environment values; keep `.vercel/` and environment files untracked. See [CLI authentication](https://vercel.com/docs/cli/global-options) and [environment variables](https://vercel.com/docs/cli/env).

## Supabase authentication configuration

Once the exact preview URL exists, add the application's callback to Supabase Authentication → URL Configuration. Current recovery code requests `/access/callback?next=/access/password`; verify the final implementation and permit that concrete callback URL. Keep the canonical Site URL pointed at the intended production origin when production is released. Prefer exact production URLs. For previews, an exact deployment or stable branch origin is narrower than an unrestricted Vercel wildcard. See [Supabase redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls).

The exposed Supabase connector has no Auth configuration update operation. Configuration must use an already authenticated dashboard or a separately authorized management API credential. SQL access does not imply permission to rewrite hosted Auth configuration.

Retain invite-only account creation. Before claiming authentication complete, use a real owner-approved administrator identity, verify invitation/recovery delivery on the configured origin, and test current grants after session refresh. Do not seed guessed owner emails or fictional production trainees.

## Hosted acceptance checks

- Public pages load in English and Arabic, language direction is correct, and navigation works at mobile and desktop widths.
- Unauthenticated private pages redirect to access; private API requests deny access without returning protected records.
- Valid login sets the expected session cookies and redirects using current server-derived roles. Logout terminates access. Callback, password recovery and invitation flows stay on the allowed origin.
- Each implemented role can complete its actual persisted workflow. A second user cannot read or mutate another user's records by replacing an object identifier.
- Same-origin mutations work on the hosted URL. Cross-origin mutations are rejected. Private responses and errors are not publicly cached.
- Database migration history matches the release, RLS remains enabled, and runtime logs contain no credentials or unexpected failures.

Record observed outcomes, not merely commands run. A successful build or reachable home page alone does not prove a finished product.

## Production release and rollback

Promote only a verified deployment within the authorized release scope, after production environment and callback settings have been checked. Changing a custom domain, audience or billing plan requires its own applicable authorization; none has been changed here.

Use the provider's deployment promotion operation and record the exact production URL. Repeat the critical public, access and role smoke checks against that URL. Preserve the previous working deployment ID. If application checks fail, restore the previous deployment or alias through Vercel's rollback workflow; do not blindly reverse database migrations. Schema changes must remain backward compatible with the preceding application release or have a separately tested recovery procedure. See [deployment management](https://vercel.com/docs/deployments).

## Open setup requirements

1. A Vercel project has not yet been created. The documented connected deployment operation can create it from verified source; its write result remains untested.
2. Preview environment variables and callback allowlist must be configured for the actual deployment.
3. An owner-approved initial administrator identity and authenticated workflow evidence are required before whole-product acceptance.
4. Final commit, provider deployment ID, URL and terminal status must be added after the actual deployment.

No deployment, domain change, environment mutation, invitation delivery or billing change was performed while preparing this runbook.
