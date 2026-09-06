# Initial owner account setup

The restored project `szlcakassgylokircuxs` contains no Auth users or application principals. No owner identity can be safely inferred from the repository name, an email in Git history, or a placeholder fixture.

## Required owner fact

The email address that should own the first real Coach Michel owner/coach administrator account. Never collect the account password in chat or put credentials into source files.

## Prepared implementation sequence

1. Confirm that exact email with the owner and inspect current Auth users again to avoid duplicate creation. Use Supabase Auth's supported admin invitation or account-creation mechanism; never write password hashes directly into `auth.users`.
2. Complete the callback/invitation/recovery implementation and configure a concrete allowed redirect on the chosen preview origin before generating an account invitation. Invitation delivery is not yet implemented in this checkpoint.
3. Link the verified Auth UUID to an ACTIVE `app_principals` USER entry. Never derive administrative roles from editable `user_metadata` or trust an unverified client-provided principal reference.
4. Prepare an explicit bootstrap transaction for the chosen roles and scoped capabilities, with owner authorization evidence, stable grant references and conflict guards. The role catalogue distinguishes coach operations (`ROL-004`), access administration (`ROL-005`), privileged-access approval (`ROL-006`), and content/policy approval (`ROL-007`). They are separate permissions, not an implicit superuser role. Preserve separation-of-duty requirements and give only the permissions required for the selected owner function.
5. Verify the actual grant set through the server authorization adapter and test successful sign-in, role destination, notices, sign-out, suspension/revocation and denial of another trainee's resource using an isolated test fixture. Keep test identities and records outside real trainee data.
6. Record non-secret setup evidence and a revocation/rollback procedure. Do not mark account integration complete just because an Auth user exists.

The public environment example uses only the project URL and publishable key. Any additional server-only credential needed for a supported administration workflow must be configured in the deployment's protected environment, never a NEXT_PUBLIC variable, chat message, Git file or screenshot.
