-- Coach Michel: one-time owner bootstrap for a privileged psql session.
-- REVIEW TEMPLATE ONLY. This script has not been executed against Supabase.
-- Never put a database password or an Auth password in this file or psql arguments.
-- Supply owner_auth_user_id, owner_email, owner_identity_confirmed=true,
-- authorization_evidence_ref as psql variables.
-- Optional grant_valid_until defaults to empty/NULL (persistent grants). If supplied,
-- it must be a future timestamp.
-- Default behavior is ROLLBACK, even with a valid identity. To persist a reviewed
-- bootstrap, explicitly provide apply_owner_bootstrap=true after reviewing the
-- dry-run grant matrix. Owner identity and authorization must be established first.
-- This never creates an Auth user or an application principal. Apply migration 07
-- before the supported Auth invitation creates its zero-grant application principal.

\set ON_ERROR_STOP on
\if :{?owner_auth_user_id}
\else
  \set owner_auth_user_id '00000000-0000-0000-0000-000000000000'
\endif
\if :{?owner_email}
\else
  \set owner_email 'REPLACE_WITH_OWNER_EMAIL'
\endif
\if :{?owner_identity_confirmed}
\else
  \set owner_identity_confirmed false
\endif
\if :{?authorization_evidence_ref}
\else
  \set authorization_evidence_ref 'REPLACE_WITH_OWNER_AUTHORIZATION_REFERENCE'
\endif
\if :{?grant_valid_until}
\else
  \set grant_valid_until ''
\endif
\if :{?apply_owner_bootstrap}
\else
  \set apply_owner_bootstrap false
\endif

BEGIN;
SET LOCAL search_path = pg_catalog, pg_temp;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';
SELECT pg_advisory_xact_lock(hashtextextended('CMH-2026-001:initial-owner-bootstrap', 0));

CREATE TEMP TABLE cmh_owner_bootstrap_input (
  auth_user_id uuid NOT NULL,
  email text NOT NULL,
  identity_confirmed boolean NOT NULL,
  authorization_evidence_ref text NOT NULL,
  valid_until timestamptz
) ON COMMIT DROP;

-- psql's :'variable' syntax quotes each input as data, not SQL code.
INSERT INTO cmh_owner_bootstrap_input VALUES (
  :'owner_auth_user_id'::uuid,
  :'owner_email',
  :'owner_identity_confirmed'::boolean,
  :'authorization_evidence_ref',
  nullif(:'grant_valid_until', '')::timestamptz
);

CREATE TEMP TABLE cmh_owner_bootstrap_matrix (
  role_id text NOT NULL,
  capability_id text NOT NULL,
  resource_id text NOT NULL,
  subject_scope text NOT NULL CHECK (subject_scope IN ('SELF', 'ADMINISTRATION')),
  PRIMARY KEY (role_id, capability_id, resource_id)
) ON COMMIT DROP;

-- Explicit bootstrap scope: own account/drafting, access administration, and
-- content/policy authoring or independent approval. No global trainee records,
-- schedules, completions, support handling, incidents, or audit-reader permission.
-- ADMINISTRATION means null subject/object scope for only the listed capability.
-- An independently authorized administrator must assign real trainee scopes;
-- the UI does not allow self-granting.
INSERT INTO cmh_owner_bootstrap_matrix VALUES
  ('ROL-004', 'CAP-002', 'RES-004', 'SELF'),
  ('ROL-004', 'CAP-003', 'RES-002', 'SELF'),
  ('ROL-004', 'CAP-003', 'RES-003', 'SELF'),
  ('ROL-004', 'CAP-003', 'RES-004', 'SELF'),
  ('ROL-004', 'CAP-003', 'RES-015', 'SELF'),
  ('ROL-004', 'CAP-006', 'RES-014', 'SELF'),
  ('ROL-004', 'CAP-008', 'RES-009', 'SELF'),
  ('ROL-004', 'CAP-009', 'RES-008', 'SELF'),
  ('ROL-005', 'CAP-015', 'RES-004', 'ADMINISTRATION'),
  ('ROL-005', 'CAP-015', 'RES-005', 'ADMINISTRATION'),
  ('ROL-006', 'CAP-015', 'RES-004', 'ADMINISTRATION'),
  ('ROL-006', 'CAP-015', 'RES-005', 'ADMINISTRATION'),
  ('ROL-007', 'CAP-010', 'RES-002', 'ADMINISTRATION'),
  ('ROL-007', 'CAP-010', 'RES-008', 'ADMINISTRATION'),
  ('ROL-007', 'CAP-011', 'RES-015', 'ADMINISTRATION');

DO $bootstrap$
DECLARE
  supplied cmh_owner_bootstrap_input%ROWTYPE;
  owner_auth auth.users%ROWTYPE;
  owner_principal public.app_principals%ROWTYPE;
  count_inserted integer;
  event_reference text;
BEGIN
  SELECT * INTO STRICT supplied FROM cmh_owner_bootstrap_input;
  IF NOT EXISTS (
    SELECT 1 FROM pg_roles WHERE rolname = current_user AND (rolsuper OR rolbypassrls)
  ) THEN
    RAISE EXCEPTION 'Bootstrap requires an explicitly authorized privileged database session';
  END IF;
  IF NOT supplied.identity_confirmed
    OR supplied.auth_user_id = '00000000-0000-0000-0000-000000000000'::uuid
    OR supplied.email <> btrim(supplied.email)
    OR supplied.email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    OR supplied.email ~* '(REPLACE_WITH|PLACEHOLDER)'
    OR length(supplied.authorization_evidence_ref) NOT BETWEEN 6 AND 200
    OR supplied.authorization_evidence_ref ~* '(REPLACE_WITH|PLACEHOLDER)'
  THEN
    RAISE EXCEPTION 'Supply the explicitly confirmed owner UUID/email and actual authorization reference';
  END IF;
  IF supplied.valid_until IS NOT NULL AND supplied.valid_until <= now() THEN
    RAISE EXCEPTION 'An optional grant expiry must be in the future';
  END IF;
  IF to_regprocedure('cmh_private.register_auth_principal()') IS NULL
    OR NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'cmh_register_auth_principal' AND NOT tgisinternal)
  THEN
    RAISE EXCEPTION 'Verify and apply migration 07 before onboarding the owner';
  END IF;

  SELECT * INTO owner_auth FROM auth.users WHERE id = supplied.auth_user_id FOR UPDATE;
  IF NOT FOUND
    OR lower(owner_auth.email) IS DISTINCT FROM lower(supplied.email)
    OR owner_auth.email_confirmed_at IS NULL
    OR coalesce((to_jsonb(owner_auth)->>'is_anonymous')::boolean, false)
    OR nullif(to_jsonb(owner_auth)->>'deleted_at', '') IS NOT NULL
    OR nullif(to_jsonb(owner_auth)->>'banned_until', '')::timestamptz > now()
  THEN
    RAISE EXCEPTION 'Exact confirmed, active Auth identity could not be verified; no grants created';
  END IF;

  SELECT * INTO owner_principal FROM public.app_principals
    WHERE auth_user_id = owner_auth.id AND principal_kind = 'USER' FOR UPDATE;
  IF NOT FOUND OR owner_principal.status <> 'ACTIVE' THEN
    RAISE EXCEPTION 'The existing zero-grant onboarding principal is missing or inactive; do not manufacture one here';
  END IF;
  IF EXISTS (SELECT 1 FROM public.principal_grants WHERE principal_id = owner_principal.id) THEN
    RAISE EXCEPTION 'This identity already has grant history; use the reviewed administration/recovery workflow';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.principal_grants g JOIN public.app_principals p ON p.id = g.principal_id
    WHERE p.status = 'ACTIVE' AND g.role_id IN ('ROL-005', 'ROL-006')
      AND g.capability_id = 'CAP-015' AND g.resource_id = 'RES-005'
      AND g.revoked_at IS NULL AND g.valid_from <= now()
      AND (g.valid_until IS NULL OR g.valid_until > now())
  ) THEN
    RAISE EXCEPTION 'An active access administrator already exists; this first-owner bootstrap is not applicable';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.coach_profiles
    WHERE principal_id = owner_principal.id AND status <> 'ACTIVE'
  ) THEN
    RAISE EXCEPTION 'Existing coach profile is inactive; review it separately';
  END IF;

  INSERT INTO public.principal_grants (
    grant_ref, principal_id, role_id, capability_id, resource_id,
    object_ref, subject_ref, valid_from, valid_until,
    approved_by_principal_id, approval_evidence
  )
  SELECT
    'BOOTSTRAP-OWNER-' || owner_auth.id::text || '-' || m.role_id || '-' || m.capability_id || '-' || m.resource_id,
    owner_principal.id, m.role_id, m.capability_id, m.resource_id,
    NULL, CASE WHEN m.subject_scope = 'SELF' THEN owner_principal.principal_ref ELSE NULL END,
    now(), supplied.valid_until, NULL,
    jsonb_build_object(
      'bootstrap', true,
      'authorization_reference', supplied.authorization_evidence_ref,
      'identity_verified_against_auth', true,
      'grant_profile', 'initial-owner-administration-v1',
      'approval_context', 'One-time owner-authorized privileged database bootstrap; not an in-app independent approval'
    )
  FROM cmh_owner_bootstrap_matrix m;
  GET DIAGNOSTICS count_inserted = ROW_COUNT;
  IF count_inserted <> 15 THEN RAISE EXCEPTION 'Unexpected bootstrap grant count'; END IF;

  INSERT INTO public.coach_profiles(coach_ref, principal_id, status, profile)
  VALUES ('CCH-BOOTSTRAP-' || owner_auth.id::text, owner_principal.id, 'ACTIVE', '{}'::jsonb)
  ON CONFLICT (principal_id) DO NOTHING;

  event_reference := 'EVT-BOOTSTRAP-OWNER-' || owner_auth.id::text;
  INSERT INTO public.audit_events (
    event_ref, actor_principal_id, action, category, object_references,
    result, reason, evidence, after_data, correlation_ref
  ) VALUES (
    event_reference, NULL, 'INITIAL_OWNER_BOOTSTRAP', 'ACCESS_ADMINISTRATION',
    jsonb_build_array(owner_principal.principal_ref), 'APPLIED_IN_TRANSACTION',
    'Create explicitly scoped first-owner grants after verified Auth onboarding',
    jsonb_build_object('authorization_reference', supplied.authorization_evidence_ref, 'operator_context', 'Privileged database session; no pre-existing application approver'),
    jsonb_build_object('grant_count', count_inserted, 'valid_until', supplied.valid_until, 'grant_profile', 'initial-owner-administration-v1'),
    supplied.authorization_evidence_ref
  );
END;
$bootstrap$;

-- Review this exact grant matrix. No Auth credentials or secrets are selected.
SELECT p.principal_ref, g.grant_ref, g.role_id, g.capability_id, g.resource_id,
       g.object_ref, g.subject_ref, g.valid_from, g.valid_until
FROM public.principal_grants g
JOIN public.app_principals p ON p.id = g.principal_id
JOIN cmh_owner_bootstrap_input supplied ON supplied.auth_user_id = p.auth_user_id
WHERE g.grant_ref LIKE 'BOOTSTRAP-OWNER-%'
ORDER BY g.role_id, g.capability_id, g.resource_id;

\if :apply_owner_bootstrap
  COMMIT;
  \echo 'Owner bootstrap committed. Verify actual login and grants; use independently approved actors for protected authoring and administration workflows.'
\else
  ROLLBACK;
  \echo 'DRY RUN complete. Grant, coach-profile, and audit changes from this transaction were rolled back.'
\endif
