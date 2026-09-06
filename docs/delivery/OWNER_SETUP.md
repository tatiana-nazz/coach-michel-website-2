# Initial owner account setup

The access lifecycle and role-based application are implemented. A real initial administrator has not been established or verified by this document. Both the Checkpoint 01 inspection and the post-migration Checkpoint 02 inspection found no Auth users or application principals in Supabase project `szlcakassgylokircuxs`; inspect current state again before creating anything.

Implementation and isolated verification can continue without a real email address. Real invitation delivery and account acceptance require the owner-designated identity. Do not infer it from a repository name, Git author, or fixture. Never collect the account password in chat or store credentials in source, reports, or screenshots.

## Prepare the actual environment

1. Record the exact deployed origin and source commit. The release migration is now verified remotely with seven history entries and 40 RLS-protected public tables; confirm that state again if the environment changed.
2. Configure the project URL and publishable key for build and runtime. Ordinary application requests do not require a service-role key. If `CMH_APP_ORIGIN` is set, it must exactly match the intended origin; do not reuse a production-only value on a rotating preview.
3. Configure Supabase callback URLs and email delivery on that origin. The recovery request uses `/access/callback?next=/access/password`. A token-hash invitation link uses `/access/callback?token_hash={{ .TokenHash }}&type=invite`; a token-hash recovery link uses `type=recovery`. The callback accepts invite/recovery hashes and verified PKCE exchanges, and uses fixed internal destinations. Keep public signup disabled.
4. Test provider configuration using explicitly designated test identities and an isolated environment. Local browser fixtures do not test actual SMTP, email links, Auth tokens, or hosted RLS.

## Bootstrap the first principal

1. Obtain the exact owner-designated email and inspect current Auth users to avoid a duplicate. Use Supabase Auth's supported administrative invitation or account-creation mechanism. Never insert password hashes directly into `auth.users`.
2. The new Auth onboarding trigger creates an ACTIVE zero-grant `app_principals` USER record when a supported Auth invitation creates the account. Verify that existing record; the bootstrap must not fabricate or duplicate it. Use the prepared [bootstrap-owner.sql](../../scripts/bootstrap-owner.sql) template for the one-time reviewed grant transaction; it uses stable references, conflict guards, and non-secret authorization evidence. Do not derive roles from editable `user_metadata`, a browser field, or an unverified principal reference.
3. Assign the minimum explicit role, capability, resource, object, subject, and validity scopes needed for the selected function. The role catalog distinguishes coach operations (`ROL-004`), access administration (`ROL-005`), privileged-access approval (`ROL-006`), and content/policy approval (`ROL-007`). There is no implicit application superuser role.
4. Establish the independently approved actors needed for publication and policy decisions. A draft author cannot satisfy an independent approval check by assigning more roles to the same account. Do not publish fabricated notices or silently bypass separation of duty to unlock the application.
5. Use the invitation callback to set a password privately, then verify sign-in, cookie refresh, role destination, and sign-out. Read the effective grant set from the database. Auth account creation alone is not successful application onboarding.

## Verify notices and real workflows

Publish the actual required notices through the draft and independent decision workflow. A trainee/candidate without the required acceptance cannot enter training. Empty or unpublished notice content does not count as acceptance. The gate uses the highest effective document version; the latest explicit decision across its equivalent English/Arabic translations controls access while the record retains the exact version accepted or declined. Account and support/privacy access remain available under their normal permissions when notices are pending or declined.

Verify real persistence separately from presentation fixtures: publish approved content, release a scoped assignment, complete it as the designated trainee, inspect the durable result, and confirm another trainee cannot access it. Test suspension/revocation, expired grants, wrong-object access, same-origin rejection, and independent operational validation. Use approved isolated test records rather than real trainee information for destructive or denial scenarios.

Record non-secret evidence, the final grant references, and a tested suspension/revocation procedure. Keep test identities and data clearly separated from real members. Mark setup complete only after the actual provider and application flows pass on the chosen origin.

## Prepared bootstrap template

`scripts/bootstrap-owner.sql` is an unexecuted psql template. It requires an explicitly confirmed Auth UUID/email, an already email-confirmed active Auth user, the existing zero-grant principal, and a real authorization evidence reference. The optional `grant_valid_until` defaults to empty/NULL; owner grants persist by default. If supplied, the expiry must be a future timestamp. Missing or placeholder identity/authorization inputs abort. The default is a rollback-only dry run; committing requires the explicit `apply_owner_bootstrap=true` psql variable after reviewing the actual dry-run output.

The template contains 15 explicit role/capability/resource grants for own account/drafting and initial access/content/policy administration. Self drafting is restricted to the owner's principal. Administrative grant delegation and content/policy scope are listed explicitly. An expiry applies only when `grant_valid_until` is supplied. It grants no global trainee-record, schedule, completion, incident, or audit-reader permission. It refuses to run for an identity with existing grant history or when an active access administrator already exists, and never inserts Auth users, password hashes, or application principals. It creates only the owner's empty coach profile if needed and records non-secret bootstrap audit evidence.

An independently authorized administrator must assign actual trainee scopes. The application forbids self-granting and self-approval of authored publication/policy decisions. A privileged database session for this one-time bootstrap is separate from the ordinary publishable-key runtime. The template was reviewed statically and has not been executed against the connected project.

## Inputs still owner-controlled

- Initial real administrator/coach email and the separately approved people who can author and approve required content.
- Approved public contact channel and the intended domain.
- Controller/privacy, retention, and publication decisions that cannot be inferred from the source.

The delivery agent should prepare and verify everything independent of these facts before asking for missing input. Any privileged provider credential needed for bootstrap belongs in a protected server environment or authenticated provider session, never a `NEXT_PUBLIC_` variable or chat message.
