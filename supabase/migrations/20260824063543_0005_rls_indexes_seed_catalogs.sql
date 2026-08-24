insert into public.role_catalog (role_id, name) values
  ('ROL-001', 'Public viewer'),
  ('ROL-002', 'Provisioning candidate'),
  ('ROL-003', 'Trainee self-service'),
  ('ROL-004', 'Coach operations'),
  ('ROL-005', 'Access administrator'),
  ('ROL-006', 'Privileged-access approver'),
  ('ROL-007', 'Content and policy approver'),
  ('ROL-008', 'Support and privacy handler'),
  ('ROL-009', 'Technical operator'),
  ('ROL-010', 'Recovery validator'),
  ('ROL-011', 'Audit reviewer'),
  ('ROL-012', 'System principal')
on conflict (role_id) do update set name = excluded.name;

insert into public.capability_catalog (capability_id, name) values
  ('CAP-001', 'Public information read'),
  ('CAP-002', 'Self access initiation and recovery'),
  ('CAP-003', 'Own account, language, and notices read'),
  ('CAP-004', 'Own assigned training read'),
  ('CAP-005', 'Own completion submit and read'),
  ('CAP-006', 'Self support and privacy routing'),
  ('CAP-007', 'Scoped trainee context read'),
  ('CAP-008', 'Program and session draft management'),
  ('CAP-009', 'Content draft management'),
  ('CAP-010', 'Content and disclosure approve/publish'),
  ('CAP-011', 'Policy configuration approve'),
  ('CAP-012', 'Assignment, schedule, and release'),
  ('CAP-013', 'Completion monitoring and reconciliation proposal'),
  ('CAP-014', 'Completion correction authorization'),
  ('CAP-015', 'Account, role, and scope administration'),
  ('CAP-016', 'Support/privacy minimum handling'),
  ('CAP-017', 'Incident and recovery operation'),
  ('CAP-018', 'Recovery validation'),
  ('CAP-019', 'Audit evidence read'),
  ('CAP-020', 'System-scoped execution')
on conflict (capability_id) do update set name = excluded.name;

insert into public.resource_catalog (resource_id, name) values
  ('RES-001', 'Approved public content'),
  ('RES-002', 'Disclosure documents and versions'),
  ('RES-003', 'Acceptance records'),
  ('RES-004', 'Person and access account'),
  ('RES-005', 'Role grants and subject scopes'),
  ('RES-006', 'Trainee profile'),
  ('RES-007', 'Coach profile'),
  ('RES-008', 'Exercise, guidance, approvals, public-content governance'),
  ('RES-009', 'Program and session definitions'),
  ('RES-010', 'Assignments, schedules, and releases'),
  ('RES-011', 'Completion submission intent'),
  ('RES-012', 'Authoritative workout completion'),
  ('RES-013', 'Reconciliation case'),
  ('RES-014', 'Support/privacy request reference'),
  ('RES-015', 'Provider and coaching-time policy'),
  ('RES-016', 'Operational incident'),
  ('RES-017', 'Recovery activity and validation evidence'),
  ('RES-018', 'Audit event'),
  ('RES-019', 'Derived status projection')
on conflict (resource_id) do update set name = excluded.name;

create or replace function public.current_app_principal_id()
returns uuid
language sql
stable
security definer
set search_path = public, auth
as $$
  select p.id
  from public.app_principals p
  where p.auth_user_id = auth.uid()
    and p.status = 'ACTIVE'
  limit 1
$$;

create or replace function public.has_active_grant(
  requested_capability_id text,
  requested_resource_id text,
  requested_object_ref text default null,
  requested_subject_ref text default null
)
returns boolean
language sql
stable
security definer
set search_path = public, auth
as $$
  select exists (
    select 1
    from public.principal_grants g
    join public.app_principals p on p.id = g.principal_id
    where g.principal_id = public.current_app_principal_id()
      and p.status = 'ACTIVE'
      and g.capability_id = requested_capability_id
      and g.resource_id = requested_resource_id
      and g.valid_from <= now()
      and (g.valid_until is null or g.valid_until > now())
      and g.revoked_at is null
      and (g.object_ref is null or g.object_ref = requested_object_ref)
      and (g.subject_ref is null or g.subject_ref = requested_subject_ref)
  )
$$;

revoke all on function public.current_app_principal_id() from public;
revoke all on function public.has_active_grant(text, text, text, text) from public;
grant execute on function public.current_app_principal_id() to authenticated;
grant execute on function public.has_active_grant(text, text, text, text) to authenticated;

alter table public.app_principals enable row level security;
alter table public.role_catalog enable row level security;
alter table public.capability_catalog enable row level security;
alter table public.resource_catalog enable row level security;
alter table public.principal_grants enable row level security;
alter table public.access_provisioning_records enable row level security;
alter table public.access_recovery_requests enable row level security;
alter table public.account_preferences enable row level security;
alter table public.trainee_profiles enable row level security;
alter table public.coach_profiles enable row level security;
alter table public.content_items enable row level security;
alter table public.content_versions enable row level security;
alter table public.content_approval_decisions enable row level security;
alter table public.disclosure_documents enable row level security;
alter table public.disclosure_versions enable row level security;
alter table public.acceptance_records enable row level security;
alter table public.program_definitions enable row level security;
alter table public.program_versions enable row level security;
alter table public.session_definitions enable row level security;
alter table public.session_versions enable row level security;
alter table public.session_exercise_links enable row level security;
alter table public.trainee_assignments enable row level security;
alter table public.session_schedules enable row level security;
alter table public.release_records enable row level security;
alter table public.completion_intents enable row level security;
alter table public.workout_completions enable row level security;
alter table public.derived_status_projections enable row level security;
alter table public.reconciliation_cases enable row level security;
alter table public.reconciliation_proposals enable row level security;
alter table public.reconciliation_authorization_decisions enable row level security;
alter table public.support_privacy_cases enable row level security;
alter table public.policies enable row level security;
alter table public.policy_versions enable row level security;
alter table public.policy_approval_decisions enable row level security;
alter table public.operational_incidents enable row level security;
alter table public.recovery_activities enable row level security;
alter table public.recovery_validations enable row level security;
alter table public.state_reconciliation_handoffs enable row level security;
alter table public.audit_events enable row level security;

revoke all on all tables in schema public from anon, authenticated;
grant usage on schema public to anon, authenticated;

grant select on public.content_versions, public.disclosure_versions to anon, authenticated;
grant select on public.role_catalog, public.capability_catalog, public.resource_catalog to authenticated;
grant select on public.app_principals, public.principal_grants, public.account_preferences to authenticated;
grant update on public.account_preferences to authenticated;

create policy app_principals_self_read
on public.app_principals
for select
to authenticated
using (auth_user_id = auth.uid());

create policy principal_grants_self_read
on public.principal_grants
for select
to authenticated
using (principal_id = public.current_app_principal_id());

create policy account_preferences_self_read
on public.account_preferences
for select
to authenticated
using (principal_id = public.current_app_principal_id());

create policy account_preferences_self_update
on public.account_preferences
for update
to authenticated
using (principal_id = public.current_app_principal_id())
with check (principal_id = public.current_app_principal_id());

create policy role_catalog_authenticated_read
on public.role_catalog
for select
to authenticated
using (true);

create policy capability_catalog_authenticated_read
on public.capability_catalog
for select
to authenticated
using (true);

create policy resource_catalog_authenticated_read
on public.resource_catalog
for select
to authenticated
using (true);

create policy public_effective_content_read
on public.content_versions
for select
to anon, authenticated
using (
  status = 'PUBLISHED'
  and (effective_from is null or effective_from <= now())
  and (effective_until is null or effective_until > now())
);

create policy public_effective_disclosure_read
on public.disclosure_versions
for select
to anon, authenticated
using (
  status = 'PUBLISHED'
  and (effective_from is null or effective_from <= now())
  and (effective_until is null or effective_until > now())
);

create or replace function public.reject_audit_event_mutation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  raise exception 'audit_events is append-only';
end;
$$;

drop trigger if exists audit_events_reject_update on public.audit_events;
create trigger audit_events_reject_update
before update on public.audit_events
for each row execute function public.reject_audit_event_mutation();

drop trigger if exists audit_events_reject_delete on public.audit_events;
create trigger audit_events_reject_delete
before delete on public.audit_events
for each row execute function public.reject_audit_event_mutation();

revoke update, delete on public.audit_events from anon, authenticated;

create unique index content_versions_one_effective_version_idx
  on public.content_versions (content_item_id, locale)
  where status = 'PUBLISHED' and effective_until is null;

create unique index disclosure_versions_one_effective_version_idx
  on public.disclosure_versions (disclosure_document_id, locale)
  where status = 'PUBLISHED' and effective_until is null;

create unique index policy_versions_one_effective_version_idx
  on public.policy_versions (policy_id)
  where status = 'PUBLISHED' and effective_until is null;
