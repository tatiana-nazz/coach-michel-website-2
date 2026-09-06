-- Generated via Supabase CLI. No data bootstrap; all application mutations are atomic.
create schema if not exists cmh_private;
revoke all on schema cmh_private from public, anon;
grant usage on schema cmh_private to authenticated;
do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'cmh_runtime') then
    create role cmh_runtime nologin noinherit;
  end if;
end $$;
do $$ begin
 if exists(select 1 from pg_roles where rolname='cmh_runtime' and (rolsuper or rolbypassrls or rolcanlogin or rolinherit)) then raise exception 'Unsafe existing cmh_runtime role'; end if;
end $$;
grant cmh_runtime to current_user;
grant usage on schema public, auth, cmh_private to cmh_runtime;
grant execute on function auth.uid() to cmh_runtime;

create function cmh_private.principal_id() returns uuid
language sql stable security definer set search_path = '' as $$
  select p.id from public.app_principals p
  where auth.uid() is not null and p.auth_user_id = auth.uid() and p.status = 'ACTIVE'
$$;


-- A language-neutral document version may be accepted in English or Arabic.
-- No published notice is an unavailable configuration, never implicit acceptance.
create function cmh_private.notices_accepted(p_principal uuid) returns boolean
language sql stable security definer set search_path='' as $$
 with effective as (
  select v.* from public.disclosure_versions v where v.status='PUBLISHED'
   and (v.effective_from is null or v.effective_from<=now()) and (v.effective_until is null or v.effective_until>now())
 ), required as (
  select disclosure_document_id,max(version_number) version_number from effective group by disclosure_document_id
 )
 select auth.uid() is not null and p_principal=cmh_private.principal_id() and (
  exists(select 1 from public.principal_grants g where g.principal_id=p_principal and g.role_id in ('ROL-004','ROL-005','ROL-006','ROL-007','ROL-008','ROL-009','ROL-010','ROL-011')
   and g.revoked_at is null and g.valid_from<=now() and (g.valid_until is null or g.valid_until>now()))
  or (exists(select 1 from required) and not exists(select 1 from required r where
   (select a.decision from public.acceptance_records a join effective e on e.id=a.disclosure_version_id
    where a.principal_id=p_principal and e.disclosure_document_id=r.disclosure_document_id and e.version_number=r.version_number
    order by a.decided_at desc,a.acceptance_ref desc limit 1) is distinct from 'ACCEPTED')))
$$;

create function cmh_private.allowed(p_cap text, p_res text, p_object text default null, p_subject uuid default null)
returns boolean language sql stable security definer set search_path = '' as $$
  select auth.uid() is not null and exists (
    select 1 from public.principal_grants g
    join public.app_principals actor on actor.id=g.principal_id
    left join public.app_principals subject on subject.id=p_subject
    left join public.trainee_profiles trainee on trainee.principal_id=p_subject
    where actor.auth_user_id=auth.uid() and actor.status='ACTIVE'
      and g.capability_id=p_cap and g.resource_id=p_res
      and (p_cap not in ('CAP-004','CAP-005') or cmh_private.notices_accepted(actor.id))
      and g.role_id = any(case p_cap
        when 'CAP-002' then array['ROL-002','ROL-003','ROL-004','ROL-005']
        when 'CAP-003' then array['ROL-002','ROL-003','ROL-004']
        when 'CAP-004' then array['ROL-003'] when 'CAP-005' then array['ROL-003']
        when 'CAP-006' then array['ROL-003','ROL-004']
        when 'CAP-007' then array['ROL-004'] when 'CAP-008' then array['ROL-004']
        when 'CAP-009' then array['ROL-004'] when 'CAP-010' then array['ROL-007']
        when 'CAP-011' then array['ROL-007'] when 'CAP-012' then array['ROL-004']
        when 'CAP-013' then array['ROL-004'] when 'CAP-014' then array['ROL-006']
        when 'CAP-015' then array['ROL-005','ROL-006'] when 'CAP-016' then array['ROL-008']
        when 'CAP-017' then array['ROL-009'] when 'CAP-018' then array['ROL-010']
        when 'CAP-019' then array['ROL-011'] else array[]::text[] end)
      and g.valid_from<=now() and (g.valid_until is null or g.valid_until>now()) and g.revoked_at is null
      and (g.object_ref is null or g.object_ref=p_object)
      and (g.subject_ref is null or g.subject_ref=subject.principal_ref or g.subject_ref=trainee.trainee_ref)
  )
$$;


create function cmh_private.resolve_subject(p_ref text) returns uuid
language sql stable security definer set search_path = '' as $$
  select p.id from public.app_principals p left join public.trainee_profiles t on t.principal_id=p.id
  where auth.uid() is not null and (p.principal_ref=p_ref or t.trainee_ref=p_ref) limit 1
$$;
create or replace function public.current_app_principal_id() returns uuid
language sql stable security invoker set search_path = '' as $$ select cmh_private.principal_id() $$;
create or replace function public.has_active_grant(requested_capability_id text, requested_resource_id text,
requested_object_ref text default null, requested_subject_ref text default null) returns boolean
language sql stable security invoker set search_path = '' as $$
 select cmh_private.allowed(requested_capability_id, requested_resource_id,requested_object_ref,
   cmh_private.resolve_subject(requested_subject_ref))
$$;

create function cmh_private.training_read(p_version uuid, p_kind text) returns boolean
language sql stable security definer set search_path = '' as $$
 select auth.uid() is not null and (
   exists(select 1 from public.session_versions v join public.session_definitions d on d.id=v.session_definition_id
      where p_kind='session' and v.id=p_version and
      (cmh_private.allowed('CAP-008','RES-009',d.session_ref,d.owner_coach_principal_id)
       or cmh_private.allowed('CAP-012','RES-009',d.session_ref,d.owner_coach_principal_id)))
   or exists(select 1 from public.program_versions v join public.program_definitions d on d.id=v.program_definition_id
      where p_kind='program' and v.id=p_version and cmh_private.allowed('CAP-008','RES-009',d.program_ref,d.owner_coach_principal_id))
   or exists(select 1 from public.trainee_assignments a
      join public.session_schedules s on s.trainee_assignment_id=a.id
      join public.release_records r on r.session_schedule_id=s.id
      where a.trainee_principal_id=cmh_private.principal_id() and a.status='ACTIVE'
      and s.status in ('RELEASED','COMPLETED') and r.status='RELEASED' and r.effective_at<=now()
      and ((p_kind='session' and s.session_version_id=p_version) or (p_kind='program' and a.program_version_id=p_version))
      and cmh_private.allowed('CAP-004','RES-009',s.schedule_ref,a.trainee_principal_id))
 )
$$;
create function cmh_private.content_read(p_item uuid) returns boolean
language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.content_items c where c.id=p_item and (
  exists(select 1 from public.content_versions v where v.content_item_id=c.id and v.status='PUBLISHED'
    and (v.effective_from is null or v.effective_from<=now()) and (v.effective_until is null or v.effective_until>now()))
  or cmh_private.allowed('CAP-009','RES-008',c.content_ref,c.created_by_principal_id)
  or cmh_private.allowed('CAP-010','RES-008',c.content_ref,c.created_by_principal_id)))
$$;
create function cmh_private.schedule_read(p_schedule uuid) returns boolean
language sql stable security definer set search_path = '' as $$
 select auth.uid() is not null and exists(select 1 from public.session_schedules s
 join public.trainee_assignments a on a.id=s.trainee_assignment_id where s.id=p_schedule and (
  (a.trainee_principal_id=cmh_private.principal_id() and a.status='ACTIVE'
   and s.status in ('RELEASED','COMPLETED') and exists(select 1 from public.release_records r where r.session_schedule_id=s.id and r.status='RELEASED' and r.effective_at<=now())
   and (cmh_private.allowed('CAP-004','RES-010',s.schedule_ref,a.trainee_principal_id) or cmh_private.allowed('CAP-005','RES-010',s.schedule_ref,a.trainee_principal_id)))
  or cmh_private.allowed('CAP-012','RES-010',s.schedule_ref,a.trainee_principal_id)
  or cmh_private.allowed('CAP-013','RES-010',s.schedule_ref,a.trainee_principal_id)))
$$;

create function cmh_private.completion_subject(p_ref text) returns uuid
language sql stable security definer set search_path='' as $$
 select trainee_principal_id from public.workout_completions where auth.uid() is not null and completion_ref=p_ref
$$;

create function cmh_private.case_read(p_case uuid) returns boolean
language sql stable security definer set search_path = '' as $$
 select auth.uid() is not null and exists(select 1 from public.reconciliation_cases c where c.id=p_case
 and (cmh_private.allowed('CAP-013','RES-013',c.case_ref,cmh_private.completion_subject(c.affected_references->>0)) or cmh_private.allowed('CAP-014','RES-013',c.case_ref,cmh_private.completion_subject(c.affected_references->>0))))
$$;
revoke all on all functions in schema cmh_private from public, anon;
grant execute on all functions in schema cmh_private to authenticated, cmh_runtime;
grant execute on function cmh_private.content_read(uuid) to anon;
grant usage on schema cmh_private to anon;
-- Public read helpers return a boolean only; they never return private rows.

grant select on public.app_principals to authenticated, cmh_runtime;
create policy runtime_app_principals_read on public.app_principals for select to authenticated, cmh_runtime using (auth_user_id=(select auth.uid()) or cmh_private.allowed('CAP-015','RES-004',principal_ref,id));

grant select on public.principal_grants to authenticated, cmh_runtime;
create policy runtime_principal_grants_read on public.principal_grants for select to authenticated, cmh_runtime using (principal_id=(select cmh_private.principal_id()) or cmh_private.allowed('CAP-015','RES-005',grant_ref,principal_id));

grant select on public.account_preferences to authenticated, cmh_runtime;
create policy runtime_account_preferences_read on public.account_preferences for select to authenticated, cmh_runtime using (principal_id=(select cmh_private.principal_id()));

grant select on public.access_provisioning_records to authenticated, cmh_runtime;
create policy runtime_access_provisioning_records_read on public.access_provisioning_records for select to authenticated, cmh_runtime using (principal_id=(select cmh_private.principal_id()) or cmh_private.allowed('CAP-015','RES-004',provisioning_ref,principal_id));

grant select on public.access_recovery_requests to authenticated, cmh_runtime;
create policy runtime_access_recovery_requests_read on public.access_recovery_requests for select to authenticated, cmh_runtime using (principal_id=(select cmh_private.principal_id()) or cmh_private.allowed('CAP-015','RES-004',recovery_request_ref,principal_id));

grant select on public.acceptance_records to authenticated, cmh_runtime;
create policy runtime_acceptance_records_read on public.acceptance_records for select to authenticated, cmh_runtime using (principal_id=(select cmh_private.principal_id()));

grant select on public.content_items to authenticated, cmh_runtime;
create policy runtime_content_items_read on public.content_items for select to authenticated, cmh_runtime using (cmh_private.content_read(id));

grant select on public.content_versions to authenticated, cmh_runtime;
create policy runtime_content_versions_read on public.content_versions for select to authenticated, cmh_runtime using (exists(select 1 from public.content_items c where c.id=content_item_id and (cmh_private.allowed('CAP-009','RES-008',c.content_ref,c.created_by_principal_id) or cmh_private.allowed('CAP-010','RES-008',c.content_ref,c.created_by_principal_id))));

grant select on public.content_approval_decisions to authenticated, cmh_runtime;
create policy runtime_content_approval_decisions_read on public.content_approval_decisions for select to authenticated, cmh_runtime using (exists(select 1 from public.content_versions v where v.id=content_version_id));

grant select on public.disclosure_documents to authenticated, cmh_runtime;
create policy runtime_disclosure_documents_read on public.disclosure_documents for select to authenticated, cmh_runtime using (exists(select 1 from public.disclosure_versions v where v.disclosure_document_id=id and v.status='PUBLISHED') or cmh_private.allowed('CAP-010','RES-002',disclosure_ref,null));

grant select on public.disclosure_versions to authenticated, cmh_runtime;
create policy runtime_disclosure_versions_read on public.disclosure_versions for select to authenticated, cmh_runtime using (cmh_private.allowed('CAP-010','RES-002',version_ref,null));

grant select on public.policies to authenticated, cmh_runtime;
create policy runtime_policies_read on public.policies for select to authenticated, cmh_runtime using (cmh_private.allowed('CAP-011','RES-015',policy_ref,null) or cmh_private.allowed('CAP-012','RES-015',policy_ref,null) or (status='PUBLISHED' and cmh_private.allowed('CAP-003','RES-015',policy_ref,cmh_private.principal_id())));

grant select on public.policy_versions to authenticated, cmh_runtime;
create policy runtime_policy_versions_read on public.policy_versions for select to authenticated, cmh_runtime using (cmh_private.allowed('CAP-011','RES-015',version_ref,null) or cmh_private.allowed('CAP-012','RES-015',version_ref,null) or (status='PUBLISHED' and cmh_private.allowed('CAP-003','RES-015',version_ref,cmh_private.principal_id())));

grant select on public.policy_approval_decisions to authenticated, cmh_runtime;
create policy runtime_policy_approval_decisions_read on public.policy_approval_decisions for select to authenticated, cmh_runtime using (cmh_private.allowed('CAP-011','RES-015',null,null));

grant select on public.trainee_profiles to authenticated, cmh_runtime;
create policy runtime_trainee_profiles_read on public.trainee_profiles for select to authenticated, cmh_runtime using ((principal_id=(select cmh_private.principal_id()) and cmh_private.allowed('CAP-004','RES-006',trainee_ref,principal_id)) or cmh_private.allowed('CAP-007','RES-006',trainee_ref,principal_id) or cmh_private.allowed('CAP-012','RES-006',trainee_ref,principal_id));

grant select on public.coach_profiles to authenticated, cmh_runtime;
create policy runtime_coach_profiles_read on public.coach_profiles for select to authenticated, cmh_runtime using (principal_id=(select cmh_private.principal_id()) or cmh_private.allowed('CAP-015','RES-007',coach_ref,principal_id));

grant select on public.program_definitions to authenticated, cmh_runtime;
create policy runtime_program_definitions_read on public.program_definitions for select to authenticated, cmh_runtime using (cmh_private.allowed('CAP-008','RES-009',program_ref,owner_coach_principal_id) or exists(select 1 from public.program_versions v where v.program_definition_id=id and cmh_private.training_read(v.id,'program')));

grant select on public.program_versions to authenticated, cmh_runtime;
create policy runtime_program_versions_read on public.program_versions for select to authenticated, cmh_runtime using (cmh_private.training_read(id,'program'));

grant select on public.session_definitions to authenticated, cmh_runtime;
create policy runtime_session_definitions_read on public.session_definitions for select to authenticated, cmh_runtime using (cmh_private.allowed('CAP-008','RES-009',session_ref,owner_coach_principal_id) or exists(select 1 from public.session_versions v where v.session_definition_id=id and cmh_private.training_read(v.id,'session')));

grant select on public.session_versions to authenticated, cmh_runtime;
create policy runtime_session_versions_read on public.session_versions for select to authenticated, cmh_runtime using (cmh_private.training_read(id,'session'));

grant select on public.session_exercise_links to authenticated, cmh_runtime;
create policy runtime_session_exercise_links_read on public.session_exercise_links for select to authenticated, cmh_runtime using (cmh_private.training_read(session_version_id,'session'));

grant select on public.trainee_assignments to authenticated, cmh_runtime;
create policy runtime_trainee_assignments_read on public.trainee_assignments for select to authenticated, cmh_runtime using ((trainee_principal_id=(select cmh_private.principal_id()) and cmh_private.allowed('CAP-004','RES-010',assignment_ref,trainee_principal_id)) or cmh_private.allowed('CAP-012','RES-010',assignment_ref,trainee_principal_id) or cmh_private.allowed('CAP-013','RES-010',assignment_ref,trainee_principal_id));

grant select on public.session_schedules to authenticated, cmh_runtime;
create policy runtime_session_schedules_read on public.session_schedules for select to authenticated, cmh_runtime using (cmh_private.schedule_read(id));

grant select on public.release_records to authenticated, cmh_runtime;
create policy runtime_release_records_read on public.release_records for select to authenticated, cmh_runtime using (cmh_private.schedule_read(session_schedule_id));

grant select on public.completion_intents to authenticated, cmh_runtime;
create policy runtime_completion_intents_read on public.completion_intents for select to authenticated, cmh_runtime using ((trainee_principal_id=(select cmh_private.principal_id()) and cmh_private.allowed('CAP-005','RES-011',intent_ref,trainee_principal_id)) or cmh_private.allowed('CAP-013','RES-011',intent_ref,trainee_principal_id));

grant select on public.workout_completions to authenticated, cmh_runtime;
create policy runtime_workout_completions_read on public.workout_completions for select to authenticated, cmh_runtime using ((trainee_principal_id=(select cmh_private.principal_id()) and (cmh_private.allowed('CAP-005','RES-012',completion_ref,trainee_principal_id) or cmh_private.allowed('CAP-004','RES-012',completion_ref,trainee_principal_id))) or cmh_private.allowed('CAP-013','RES-012',completion_ref,trainee_principal_id) or cmh_private.allowed('CAP-014','RES-012',completion_ref,trainee_principal_id));

grant select on public.derived_status_projections to authenticated, cmh_runtime;
create policy runtime_derived_status_projections_read on public.derived_status_projections for select to authenticated, cmh_runtime using ((cmh_private.resolve_subject(subject_ref)=cmh_private.principal_id() and cmh_private.allowed('CAP-004','RES-019',projection_ref,cmh_private.resolve_subject(subject_ref))) or cmh_private.allowed('CAP-013','RES-019',projection_ref,cmh_private.resolve_subject(subject_ref)));

grant select on public.reconciliation_cases to authenticated, cmh_runtime;
create policy runtime_reconciliation_cases_read on public.reconciliation_cases for select to authenticated, cmh_runtime using (cmh_private.case_read(id));

grant select on public.reconciliation_proposals to authenticated, cmh_runtime;
create policy runtime_reconciliation_proposals_read on public.reconciliation_proposals for select to authenticated, cmh_runtime using (cmh_private.case_read(reconciliation_case_id));

grant select on public.reconciliation_authorization_decisions to authenticated, cmh_runtime;
create policy runtime_reconciliation_authorization_decisions_read on public.reconciliation_authorization_decisions for select to authenticated, cmh_runtime using (cmh_private.case_read(reconciliation_case_id));

grant select on public.support_privacy_cases to authenticated, cmh_runtime;
create policy runtime_support_privacy_cases_read on public.support_privacy_cases for select to authenticated, cmh_runtime using ((principal_id=(select cmh_private.principal_id()) and cmh_private.allowed('CAP-006','RES-014',case_ref,principal_id)) or cmh_private.allowed('CAP-016','RES-014',case_ref,principal_id));

grant select on public.operational_incidents to authenticated, cmh_runtime;
create policy runtime_operational_incidents_read on public.operational_incidents for select to authenticated, cmh_runtime using (cmh_private.allowed('CAP-017','RES-016',incident_ref,null) or cmh_private.allowed('CAP-018','RES-016',incident_ref,null));

grant select on public.recovery_activities to authenticated, cmh_runtime;
create policy runtime_recovery_activities_read on public.recovery_activities for select to authenticated, cmh_runtime using (cmh_private.allowed('CAP-017','RES-017',recovery_activity_ref,null) or cmh_private.allowed('CAP-018','RES-017',recovery_activity_ref,null));

grant select on public.recovery_validations to authenticated, cmh_runtime;
create policy runtime_recovery_validations_read on public.recovery_validations for select to authenticated, cmh_runtime using (cmh_private.allowed('CAP-017','RES-017',validation_ref,null) or cmh_private.allowed('CAP-018','RES-017',validation_ref,null));

grant select on public.state_reconciliation_handoffs to authenticated, cmh_runtime;
create policy runtime_state_reconciliation_handoffs_read on public.state_reconciliation_handoffs for select to authenticated, cmh_runtime using (cmh_private.allowed('CAP-017','RES-017',handoff_ref,null) or cmh_private.allowed('CAP-018','RES-017',handoff_ref,null));

grant select on public.audit_events to authenticated, cmh_runtime;
create policy runtime_audit_events_read on public.audit_events for select to authenticated, cmh_runtime using (exists(select 1 from jsonb_array_elements_text(object_references) refs(ref) where cmh_private.allowed('CAP-019','RES-018',refs.ref,null)) or cmh_private.allowed('CAP-019','RES-018',event_ref,null));

grant insert on public.acceptance_records to cmh_runtime;
create policy runtime_acceptance_records_insert on public.acceptance_records for insert to cmh_runtime with check (principal_id=cmh_private.principal_id());
grant update on public.acceptance_records to cmh_runtime;
create policy runtime_acceptance_records_update on public.acceptance_records for update to cmh_runtime using (principal_id=cmh_private.principal_id()) with check (principal_id=cmh_private.principal_id());

grant insert on public.account_preferences to cmh_runtime;
create policy runtime_account_preferences_insert on public.account_preferences for insert to cmh_runtime with check (principal_id=cmh_private.principal_id());
grant update on public.account_preferences to cmh_runtime;
create policy runtime_account_preferences_update on public.account_preferences for update to cmh_runtime using (principal_id=cmh_private.principal_id()) with check (principal_id=cmh_private.principal_id());

grant insert on public.content_items to cmh_runtime;
create policy runtime_content_items_insert on public.content_items for insert to cmh_runtime with check (cmh_private.allowed('CAP-009','RES-008',content_ref,created_by_principal_id) or cmh_private.allowed('CAP-010','RES-008',content_ref,created_by_principal_id));
grant update on public.content_items to cmh_runtime;
create policy runtime_content_items_update on public.content_items for update to cmh_runtime using (cmh_private.allowed('CAP-009','RES-008',content_ref,created_by_principal_id) or cmh_private.allowed('CAP-010','RES-008',content_ref,created_by_principal_id)) with check (cmh_private.allowed('CAP-009','RES-008',content_ref,created_by_principal_id) or cmh_private.allowed('CAP-010','RES-008',content_ref,created_by_principal_id));

grant insert on public.content_versions to cmh_runtime;
create policy runtime_content_versions_insert on public.content_versions for insert to cmh_runtime with check (exists(select 1 from public.content_items c where c.id=content_item_id and (cmh_private.allowed('CAP-009','RES-008',c.content_ref,c.created_by_principal_id) or cmh_private.allowed('CAP-010','RES-008',c.content_ref,c.created_by_principal_id))));
grant update on public.content_versions to cmh_runtime;
create policy runtime_content_versions_update on public.content_versions for update to cmh_runtime using (exists(select 1 from public.content_items c where c.id=content_item_id and (cmh_private.allowed('CAP-009','RES-008',c.content_ref,c.created_by_principal_id) or cmh_private.allowed('CAP-010','RES-008',c.content_ref,c.created_by_principal_id)))) with check (exists(select 1 from public.content_items c where c.id=content_item_id and (cmh_private.allowed('CAP-009','RES-008',c.content_ref,c.created_by_principal_id) or cmh_private.allowed('CAP-010','RES-008',c.content_ref,c.created_by_principal_id))));

grant insert on public.content_approval_decisions to cmh_runtime;
create policy runtime_content_approval_decisions_insert on public.content_approval_decisions for insert to cmh_runtime with check (actor_principal_id=cmh_private.principal_id() and cmh_private.allowed('CAP-010','RES-008',null,null));

grant insert on public.policy_versions to cmh_runtime;
create policy runtime_policy_versions_insert on public.policy_versions for insert to cmh_runtime with check (cmh_private.allowed('CAP-011','RES-015',version_ref,null));
grant update on public.policy_versions to cmh_runtime;
create policy runtime_policy_versions_update on public.policy_versions for update to cmh_runtime using (cmh_private.allowed('CAP-011','RES-015',version_ref,null)) with check (cmh_private.allowed('CAP-011','RES-015',version_ref,null));

grant insert on public.policies to cmh_runtime;
create policy runtime_policies_insert on public.policies for insert to cmh_runtime with check (cmh_private.allowed('CAP-011','RES-015',policy_ref,null));
grant update on public.policies to cmh_runtime;
create policy runtime_policies_update on public.policies for update to cmh_runtime using (cmh_private.allowed('CAP-011','RES-015',policy_ref,null)) with check (cmh_private.allowed('CAP-011','RES-015',policy_ref,null));

grant insert on public.policy_approval_decisions to cmh_runtime;
create policy runtime_policy_approval_decisions_insert on public.policy_approval_decisions for insert to cmh_runtime with check (actor_principal_id=cmh_private.principal_id() and cmh_private.allowed('CAP-011','RES-015',null,null));

grant insert on public.program_definitions to cmh_runtime;
create policy runtime_program_definitions_insert on public.program_definitions for insert to cmh_runtime with check (cmh_private.allowed('CAP-008','RES-009',program_ref,owner_coach_principal_id));
grant update on public.program_definitions to cmh_runtime;
create policy runtime_program_definitions_update on public.program_definitions for update to cmh_runtime using (cmh_private.allowed('CAP-008','RES-009',program_ref,owner_coach_principal_id)) with check (cmh_private.allowed('CAP-008','RES-009',program_ref,owner_coach_principal_id));

grant insert on public.program_versions to cmh_runtime;
create policy runtime_program_versions_insert on public.program_versions for insert to cmh_runtime with check (exists(select 1 from public.program_definitions d where d.id=program_definition_id and cmh_private.allowed('CAP-008','RES-009',d.program_ref,d.owner_coach_principal_id)));
grant update on public.program_versions to cmh_runtime;
create policy runtime_program_versions_update on public.program_versions for update to cmh_runtime using (exists(select 1 from public.program_definitions d where d.id=program_definition_id and cmh_private.allowed('CAP-008','RES-009',d.program_ref,d.owner_coach_principal_id))) with check (exists(select 1 from public.program_definitions d where d.id=program_definition_id and cmh_private.allowed('CAP-008','RES-009',d.program_ref,d.owner_coach_principal_id)));

grant insert on public.session_definitions to cmh_runtime;
create policy runtime_session_definitions_insert on public.session_definitions for insert to cmh_runtime with check (cmh_private.allowed('CAP-008','RES-009',session_ref,owner_coach_principal_id));
grant update on public.session_definitions to cmh_runtime;
create policy runtime_session_definitions_update on public.session_definitions for update to cmh_runtime using (cmh_private.allowed('CAP-008','RES-009',session_ref,owner_coach_principal_id)) with check (cmh_private.allowed('CAP-008','RES-009',session_ref,owner_coach_principal_id));

grant insert on public.session_versions to cmh_runtime;
create policy runtime_session_versions_insert on public.session_versions for insert to cmh_runtime with check (exists(select 1 from public.session_definitions d where d.id=session_definition_id and cmh_private.allowed('CAP-008','RES-009',d.session_ref,d.owner_coach_principal_id)));
grant update on public.session_versions to cmh_runtime;
create policy runtime_session_versions_update on public.session_versions for update to cmh_runtime using (exists(select 1 from public.session_definitions d where d.id=session_definition_id and cmh_private.allowed('CAP-008','RES-009',d.session_ref,d.owner_coach_principal_id))) with check (exists(select 1 from public.session_definitions d where d.id=session_definition_id and cmh_private.allowed('CAP-008','RES-009',d.session_ref,d.owner_coach_principal_id)));

grant insert on public.session_exercise_links to cmh_runtime;
create policy runtime_session_exercise_links_insert on public.session_exercise_links for insert to cmh_runtime with check (cmh_private.training_read(session_version_id,'session'));

grant insert on public.trainee_assignments to cmh_runtime;
create policy runtime_trainee_assignments_insert on public.trainee_assignments for insert to cmh_runtime with check (cmh_private.allowed('CAP-012','RES-010',assignment_ref,trainee_principal_id));
grant update on public.trainee_assignments to cmh_runtime;
create policy runtime_trainee_assignments_update on public.trainee_assignments for update to cmh_runtime using (cmh_private.allowed('CAP-012','RES-010',assignment_ref,trainee_principal_id)) with check (cmh_private.allowed('CAP-012','RES-010',assignment_ref,trainee_principal_id));

grant insert on public.session_schedules to cmh_runtime;
create policy runtime_session_schedules_insert on public.session_schedules for insert to cmh_runtime with check (exists(select 1 from public.trainee_assignments a where a.id=trainee_assignment_id and (cmh_private.allowed('CAP-012','RES-010',schedule_ref,a.trainee_principal_id) or (a.trainee_principal_id=cmh_private.principal_id() and cmh_private.allowed('CAP-005','RES-010',schedule_ref,a.trainee_principal_id)))));
grant update on public.session_schedules to cmh_runtime;
create policy runtime_session_schedules_update on public.session_schedules for update to cmh_runtime using (exists(select 1 from public.trainee_assignments a where a.id=trainee_assignment_id and (cmh_private.allowed('CAP-012','RES-010',schedule_ref,a.trainee_principal_id) or (a.trainee_principal_id=cmh_private.principal_id() and cmh_private.allowed('CAP-005','RES-010',schedule_ref,a.trainee_principal_id))))) with check (exists(select 1 from public.trainee_assignments a where a.id=trainee_assignment_id and (cmh_private.allowed('CAP-012','RES-010',schedule_ref,a.trainee_principal_id) or (a.trainee_principal_id=cmh_private.principal_id() and cmh_private.allowed('CAP-005','RES-010',schedule_ref,a.trainee_principal_id)))));

grant insert on public.release_records to cmh_runtime;
create policy runtime_release_records_insert on public.release_records for insert to cmh_runtime with check (exists(select 1 from public.trainee_assignments a where a.id=trainee_assignment_id and cmh_private.allowed('CAP-012','RES-010',release_ref,a.trainee_principal_id)));

grant insert on public.completion_intents to cmh_runtime;
create policy runtime_completion_intents_insert on public.completion_intents for insert to cmh_runtime with check (trainee_principal_id=cmh_private.principal_id() and cmh_private.allowed('CAP-005','RES-011',intent_ref,trainee_principal_id));
grant update on public.completion_intents to cmh_runtime;
create policy runtime_completion_intents_update on public.completion_intents for update to cmh_runtime using (trainee_principal_id=cmh_private.principal_id() and cmh_private.allowed('CAP-005','RES-011',intent_ref,trainee_principal_id)) with check (trainee_principal_id=cmh_private.principal_id() and cmh_private.allowed('CAP-005','RES-011',intent_ref,trainee_principal_id));

grant insert on public.workout_completions to cmh_runtime;
create policy runtime_workout_completions_insert on public.workout_completions for insert to cmh_runtime with check ((trainee_principal_id=cmh_private.principal_id() and cmh_private.allowed('CAP-005','RES-012',completion_ref,trainee_principal_id)) or cmh_private.allowed('CAP-014','RES-012',completion_ref,trainee_principal_id));
grant update on public.workout_completions to cmh_runtime;
create policy runtime_workout_completions_update on public.workout_completions for update to cmh_runtime using ((trainee_principal_id=cmh_private.principal_id() and cmh_private.allowed('CAP-005','RES-012',completion_ref,trainee_principal_id)) or cmh_private.allowed('CAP-014','RES-012',completion_ref,trainee_principal_id)) with check ((trainee_principal_id=cmh_private.principal_id() and cmh_private.allowed('CAP-005','RES-012',completion_ref,trainee_principal_id)) or cmh_private.allowed('CAP-014','RES-012',completion_ref,trainee_principal_id));

grant insert on public.reconciliation_cases to cmh_runtime;
create policy runtime_reconciliation_cases_insert on public.reconciliation_cases for insert to cmh_runtime with check (cmh_private.allowed('CAP-013','RES-013',case_ref,cmh_private.completion_subject(affected_references->>0)) or cmh_private.allowed('CAP-014','RES-013',case_ref,cmh_private.completion_subject(affected_references->>0)));
grant update on public.reconciliation_cases to cmh_runtime;
create policy runtime_reconciliation_cases_update on public.reconciliation_cases for update to cmh_runtime using (cmh_private.allowed('CAP-013','RES-013',case_ref,cmh_private.completion_subject(affected_references->>0)) or cmh_private.allowed('CAP-014','RES-013',case_ref,cmh_private.completion_subject(affected_references->>0))) with check (cmh_private.allowed('CAP-013','RES-013',case_ref,cmh_private.completion_subject(affected_references->>0)) or cmh_private.allowed('CAP-014','RES-013',case_ref,cmh_private.completion_subject(affected_references->>0)));

grant insert on public.reconciliation_proposals to cmh_runtime;
create policy runtime_reconciliation_proposals_insert on public.reconciliation_proposals for insert to cmh_runtime with check (created_by_principal_id=cmh_private.principal_id() and cmh_private.case_read(reconciliation_case_id));
grant update on public.reconciliation_proposals to cmh_runtime;
create policy runtime_reconciliation_proposals_update on public.reconciliation_proposals for update to cmh_runtime using (created_by_principal_id=cmh_private.principal_id() and cmh_private.case_read(reconciliation_case_id)) with check (created_by_principal_id=cmh_private.principal_id() and cmh_private.case_read(reconciliation_case_id));

grant insert on public.reconciliation_authorization_decisions to cmh_runtime;
create policy runtime_reconciliation_authorization_decisions_insert on public.reconciliation_authorization_decisions for insert to cmh_runtime with check (actor_principal_id=cmh_private.principal_id() and cmh_private.case_read(reconciliation_case_id));

grant insert on public.support_privacy_cases to cmh_runtime;
create policy runtime_support_privacy_cases_insert on public.support_privacy_cases for insert to cmh_runtime with check ((principal_id=(select cmh_private.principal_id()) and cmh_private.allowed('CAP-006','RES-014',case_ref,principal_id)) or cmh_private.allowed('CAP-016','RES-014',case_ref,principal_id));
grant update on public.support_privacy_cases to cmh_runtime;
create policy runtime_support_privacy_cases_update on public.support_privacy_cases for update to cmh_runtime using ((principal_id=(select cmh_private.principal_id()) and cmh_private.allowed('CAP-006','RES-014',case_ref,principal_id)) or cmh_private.allowed('CAP-016','RES-014',case_ref,principal_id)) with check ((principal_id=(select cmh_private.principal_id()) and cmh_private.allowed('CAP-006','RES-014',case_ref,principal_id)) or cmh_private.allowed('CAP-016','RES-014',case_ref,principal_id));

grant insert on public.operational_incidents to cmh_runtime;
create policy runtime_operational_incidents_insert on public.operational_incidents for insert to cmh_runtime with check (cmh_private.allowed('CAP-017','RES-016',incident_ref,null));
grant update on public.operational_incidents to cmh_runtime;
create policy runtime_operational_incidents_update on public.operational_incidents for update to cmh_runtime using (cmh_private.allowed('CAP-017','RES-016',incident_ref,null)) with check (cmh_private.allowed('CAP-017','RES-016',incident_ref,null));

grant insert on public.recovery_activities to cmh_runtime;
create policy runtime_recovery_activities_insert on public.recovery_activities for insert to cmh_runtime with check (cmh_private.allowed('CAP-017','RES-017',recovery_activity_ref,null));

grant insert on public.recovery_validations to cmh_runtime;
create policy runtime_recovery_validations_insert on public.recovery_validations for insert to cmh_runtime with check (validator_principal_id=cmh_private.principal_id() and cmh_private.allowed('CAP-018','RES-017',validation_ref,null));

grant insert on public.state_reconciliation_handoffs to cmh_runtime;
create policy runtime_state_reconciliation_handoffs_insert on public.state_reconciliation_handoffs for insert to cmh_runtime with check (cmh_private.allowed('CAP-018','RES-017',handoff_ref,null));

grant insert on public.principal_grants to cmh_runtime;
create policy runtime_principal_grants_insert on public.principal_grants for insert to cmh_runtime with check (cmh_private.allowed('CAP-015','RES-005',grant_ref,principal_id));
grant update on public.principal_grants to cmh_runtime;
create policy runtime_principal_grants_update on public.principal_grants for update to cmh_runtime using (cmh_private.allowed('CAP-015','RES-005',grant_ref,principal_id)) with check (cmh_private.allowed('CAP-015','RES-005',grant_ref,principal_id));

grant insert on public.audit_events to cmh_runtime;
create policy runtime_audit_events_insert on public.audit_events for insert to cmh_runtime with check (actor_principal_id=cmh_private.principal_id());

grant usage, select on sequence public.audit_events_id_seq to cmh_runtime;
grant select on public.role_catalog, public.capability_catalog, public.resource_catalog to cmh_runtime;

-- Exactly one canonical completion per schedule; retries cannot create duplicate progress.
create unique index recovery_validations_one_per_activity on public.recovery_validations(recovery_activity_id);
create unique index handoffs_one_per_validation on public.state_reconciliation_handoffs(recovery_validation_id);
create unique index workout_completions_one_per_schedule on public.workout_completions(session_schedule_id);
create index trainee_assignments_version_read on public.trainee_assignments(session_version_id,trainee_principal_id);
create index release_records_schedule_read on public.release_records(session_schedule_id,status,effective_at);
create index trainee_profiles_principal_status on public.trainee_profiles(principal_id,status);

create function cmh_private.require(p_allowed boolean) returns void language plpgsql security invoker set search_path='' as $$
begin if p_allowed is not true then raise exception using errcode='42501', message='Operation denied'; end if; end $$;
create function cmh_private.text_field(p jsonb,k text,min_length int default 1,max_length int default 2000)
returns text language plpgsql immutable security invoker set search_path='' as $$
declare v text; begin
 if jsonb_typeof(p->k) is distinct from 'string' then raise exception using errcode='22023',message='Invalid text field'; end if;
 v=btrim(p->>k); if length(v)<min_length or length(v)>max_length then raise exception using errcode='22023',message='Invalid text length'; end if; return v;
end $$;


create table cmh_private.command_intents (
 actor_principal_id uuid not null references public.app_principals(id),
 operation_id text not null,
 business_intent_ref text not null,
 request_payload jsonb not null,
 response_payload jsonb not null,
 created_at timestamptz not null default now(),
 primary key(actor_principal_id,operation_id,business_intent_ref)
);
alter table cmh_private.command_intents enable row level security;
revoke all on cmh_private.command_intents from public,anon,authenticated;
grant select,insert on cmh_private.command_intents to cmh_runtime;
create policy command_intents_self_read on cmh_private.command_intents for select to cmh_runtime using(actor_principal_id=cmh_private.principal_id());
create policy command_intents_self_insert on cmh_private.command_intents for insert to cmh_runtime with check(actor_principal_id=cmh_private.principal_id());


alter table public.disclosure_versions add column created_by_principal_id uuid references public.app_principals(id) on delete set null;
create table public.disclosure_approval_decisions (
 id uuid primary key default gen_random_uuid(),decision_ref text not null unique,
 disclosure_version_id uuid not null references public.disclosure_versions(id),
 decision text not null check(decision in ('APPROVE','DENY')),
 actor_principal_id uuid not null references public.app_principals(id),
 reason text not null,created_at timestamptz not null default now()
);
alter table public.disclosure_approval_decisions enable row level security;
revoke all on public.disclosure_approval_decisions from public,anon,authenticated;
grant select on public.disclosure_approval_decisions to authenticated,cmh_runtime;
grant insert on public.disclosure_approval_decisions to cmh_runtime;
create policy disclosure_decisions_read on public.disclosure_approval_decisions for select to authenticated,cmh_runtime using(cmh_private.allowed('CAP-010','RES-002',null,null));
create policy disclosure_decisions_insert on public.disclosure_approval_decisions for insert to cmh_runtime with check(actor_principal_id=cmh_private.principal_id() and cmh_private.allowed('CAP-010','RES-002',null,null));
grant insert,update on public.disclosure_documents,public.disclosure_versions to cmh_runtime;
create policy disclosure_documents_insert on public.disclosure_documents for insert to cmh_runtime with check(cmh_private.allowed('CAP-010','RES-002',disclosure_ref,null));
create policy disclosure_documents_update on public.disclosure_documents for update to cmh_runtime using(cmh_private.allowed('CAP-010','RES-002',disclosure_ref,null)) with check(cmh_private.allowed('CAP-010','RES-002',disclosure_ref,null));
create policy disclosure_versions_insert on public.disclosure_versions for insert to cmh_runtime with check(cmh_private.allowed('CAP-010','RES-002',version_ref,null));
create policy disclosure_versions_update on public.disclosure_versions for update to cmh_runtime using(cmh_private.allowed('CAP-010','RES-002',version_ref,null)) with check(cmh_private.allowed('CAP-010','RES-002',version_ref,null));
create unique index policies_one_active_coaching_time on public.policies(policy_kind) where policy_kind='COACHING_TIME' and status='PUBLISHED';

create function cmh_private.run_command(p_operation text,p_payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
#variable_conflict use_variable
declare
 actor uuid:=cmh_private.principal_id(); subject uuid; parent_id uuid; version_id uuid; schedule_id uuid;
 v record; old record; row_id uuid; second_id uuid; new_ref text; parent_ref text; version_ref text;
 outcome jsonb; refs jsonb:='[]'; event_ref text:='EVT-'||gen_random_uuid();
 title text; reason text; locale text; decision text; expected bigint; next_version integer; i integer; item jsonb;
 policy_snapshot jsonb; intent_key text; saved_intent record; at_time timestamptz; existing_intent uuid; completion_id uuid; preview boolean; is_program boolean; is_revise boolean;
begin
 perform cmh_private.require(actor is not null);
 if p_payload is null or jsonb_typeof(p_payload)<>'object' or octet_length(p_payload::text)>32768 then
   raise exception using errcode='22023',message='Invalid command body';
 end if;
 if p_operation='p3s11_apin_030_post_1' then
  intent_key:=cmh_private.text_field(p_payload,'businessIntentRef',8,200);
  perform pg_advisory_xact_lock(hashtextextended(actor::text||p_operation||intent_key,0));
  select * into saved_intent from cmh_private.command_intents where actor_principal_id=actor and operation_id=p_operation and business_intent_ref=intent_key;
  if found then
   if saved_intent.request_payload<>p_payload then raise exception using errcode='40001',message='Business intent conflict'; end if;
   perform cmh_private.require(cmh_private.allowed('CAP-012','RES-010',null,cmh_private.resolve_subject(p_payload->>'traineeRef')));
   return saved_intent.response_payload;
  end if;
 end if;
 case

 when p_operation in ('delivery_create_disclosure_draft','delivery_revise_disclosure_draft') then
  title:=cmh_private.text_field(p_payload,'title',2,160); reason:=cmh_private.text_field(p_payload,'reason',3,2000);
  parent_ref:=cmh_private.text_field(p_payload,'body',20,16000); locale:=coalesce(p_payload->>'locale','en');
  if locale not in ('en','ar') then raise exception using errcode='22023',message='Invalid locale'; end if;
  perform cmh_private.require(cmh_private.allowed('CAP-010','RES-002',null,null));
  item:=jsonb_build_object('title',title,'body',parent_ref);
  if p_operation='delivery_create_disclosure_draft' then
   parent_ref:='DOC-'||gen_random_uuid(); next_version:=1;
   insert into public.disclosure_documents(disclosure_ref,disclosure_kind,status,metadata) values(parent_ref,'SERVICE','DRAFT',jsonb_build_object('title',title)) returning id into parent_id;
  else
   version_ref:=cmh_private.text_field(p_payload,'draftRef',1,200); expected:=(p_payload->>'expectedVersion')::bigint;
   select d.* into v from public.disclosure_documents d join public.disclosure_versions ver on ver.disclosure_document_id=d.id where ver.version_ref=version_ref for update of d;
   if not found then raise exception using errcode='P0002',message='Disclosure draft unavailable'; end if;
   parent_id:=v.id; parent_ref:=v.disclosure_ref;
   select max(version_number) into next_version from public.disclosure_versions where disclosure_document_id=parent_id;
   if expected is null or expected<>next_version then raise exception using errcode='40001',message='Disclosure version changed'; end if; next_version:=next_version+1;
  end if;
  version_ref:='DV-'||gen_random_uuid();
  insert into public.disclosure_versions(disclosure_document_id,version_ref,version_number,locale,body,status,created_by_principal_id,provider_evidence)
   values(parent_id,version_ref,next_version,locale,item,'DRAFT',actor,jsonb_build_object('changeReason',reason,'source','explicit-author-draft'));
  outcome:=jsonb_build_object('disclosureRef',parent_ref,'versionRef',version_ref,'draftRef',version_ref,'versionNumber',next_version,'status','DRAFT'); refs:=jsonb_build_array(parent_ref,version_ref);
 when p_operation in ('delivery_create_policy_draft','delivery_revise_policy_draft') then
  title:=cmh_private.text_field(p_payload,'title',2,160); reason:=cmh_private.text_field(p_payload,'reason',3,2000);
  if p_payload->>'timezone' is distinct from 'UTC' or (p_payload->>'maxAdvanceDays')::integer not between 1 and 730 or (p_payload->>'allowPastDays')::integer not between 0 and 7 or p_payload->>'maxAdvanceDays' is null or p_payload->>'allowPastDays' is null then raise exception using errcode='22023',message='Invalid coaching-time policy'; end if;
  perform cmh_private.require(cmh_private.allowed('CAP-011','RES-015',null,null));
  item:=jsonb_build_object('title',title,'timezone','UTC','maxAdvanceDays',(p_payload->>'maxAdvanceDays')::integer,'allowPastDays',(p_payload->>'allowPastDays')::integer);
  if p_operation='delivery_create_policy_draft' then
   parent_ref:='POL-'||gen_random_uuid(); next_version:=1;
   insert into public.policies(policy_ref,policy_kind,status,metadata) values(parent_ref,'COACHING_TIME','DRAFT',jsonb_build_object('title',title)) returning id into parent_id;
  else
   version_ref:=cmh_private.text_field(p_payload,'draftRef',1,200); expected:=(p_payload->>'expectedVersion')::bigint;
   select d.* into v from public.policies d join public.policy_versions ver on ver.policy_id=d.id where ver.version_ref=version_ref for update of d;
   if not found then raise exception using errcode='P0002',message='Policy draft unavailable'; end if;
   parent_id:=v.id; parent_ref:=v.policy_ref;
   select max(version_number) into next_version from public.policy_versions where policy_id=parent_id;
   if expected is null or expected<>next_version then raise exception using errcode='40001',message='Policy version changed'; end if; next_version:=next_version+1;
  end if;
  version_ref:='PV-'||gen_random_uuid();
  insert into public.policy_versions(policy_id,version_ref,version_number,payload,status,created_by_principal_id) values(parent_id,version_ref,next_version,item,'DRAFT',actor);
  outcome:=jsonb_build_object('policyRef',parent_ref,'versionRef',version_ref,'draftRef',version_ref,'versionNumber',next_version,'status','DRAFT'); refs:=jsonb_build_array(parent_ref,version_ref);

 when p_operation='p3s11_apin_009_post_1' then
  version_ref:=cmh_private.text_field(p_payload,'disclosureVersionReference',1,200);
  decision:=p_payload->>'response';
  if decision not in ('accept','decline') or decision is null then raise exception using errcode='22023',message='Invalid decision'; end if;
  select * into v from public.disclosure_versions d where d.version_ref=version_ref for share;
  if not found or v.status<>'PUBLISHED' or v.effective_from>now() or v.effective_until<=now() or exists(select 1 from public.disclosure_versions newer where newer.disclosure_document_id=v.disclosure_document_id and newer.version_number>v.version_number and newer.status='PUBLISHED' and (newer.effective_from is null or newer.effective_from<=now()) and (newer.effective_until is null or newer.effective_until>now())) then raise exception using errcode='40001',message='Disclosure is no longer effective'; end if;
  if nullif(btrim(coalesce(v.body->>'title',v.body->>'heading','')),'') is null or (nullif(btrim(coalesce(v.body->>'body',v.body->>'text',v.body->>'content','')),'') is null and not (jsonb_typeof(v.body->'paragraphs')='array' and jsonb_array_length(v.body->'paragraphs')>0)) then raise exception using errcode='40001',message='Notice content unavailable'; end if;
  perform cmh_private.require(cmh_private.allowed('CAP-003','RES-003',version_ref,actor));
  new_ref:='ACC-'||gen_random_uuid();
  insert into public.acceptance_records(acceptance_ref,principal_id,disclosure_version_id,decision,evidence)
  values(new_ref,actor,v.id,case decision when 'accept' then 'ACCEPTED' else 'DECLINED' end,jsonb_build_object('versionRef',version_ref,'source','explicit-user-response'))
  on conflict(principal_id,disclosure_version_id) do update set decision=excluded.decision,evidence=excluded.evidence,decided_at=now()
  returning acceptance_ref into new_ref;
  outcome:=jsonb_build_object('acceptanceRef',new_ref,'disclosureVersionReference',version_ref,'response',decision,'decision',case decision when 'accept' then 'ACCEPTED' else 'DECLINED' end,'status','RECORDED');
  refs:=jsonb_build_array(new_ref,version_ref);
 when p_operation='p3s11_apin_016_post_1' then
  parent_ref:=cmh_private.text_field(p_payload,'scheduleRef',1,200);
  new_ref:=cmh_private.text_field(p_payload,'businessIntentRef',8,200);
  if jsonb_typeof(coalesce(p_payload->'clientEvidenceContext','{}'))<>'object' then raise exception using errcode='22023',message='Invalid evidence'; end if;
  select s.*,a.trainee_principal_id,a.status as assignment_status into v from public.session_schedules s
   join public.trainee_assignments a on a.id=s.trainee_assignment_id where s.schedule_ref=parent_ref for update of s;
  if not found then raise exception using errcode='P0002',message='Schedule unavailable'; end if;
  subject:=v.trainee_principal_id; schedule_id:=v.id;
  perform cmh_private.require(subject=actor and cmh_private.allowed('CAP-005','RES-010',parent_ref,subject)
   and cmh_private.allowed('CAP-005','RES-011',null,subject) and cmh_private.allowed('CAP-005','RES-012',null,subject));
  select * into old from public.completion_intents c where c.business_intent_ref=new_ref;
  if found then
   if old.session_schedule_id<>schedule_id or old.trainee_principal_id<>actor or old.client_evidence_context<>coalesce(p_payload->'clientEvidenceContext','{}') then raise exception using errcode='40001',message='Business intent conflict'; end if;
   select * into v from public.workout_completions c where c.completion_intent_id=old.id;
   if not found then raise exception using errcode='40001',message='Intent awaits reconciliation'; end if;
   return jsonb_build_object('intentRef',old.intent_ref,'completionRef',v.completion_ref,'status','CONFIRMED');
  end if;
  if v.status<>'RELEASED' or v.assignment_status<>'ACTIVE' or not exists(select 1 from public.release_records r where r.session_schedule_id=schedule_id and r.status='RELEASED' and r.effective_at<=now()) then raise exception using errcode='40001',message='Session is not released'; end if;
  if exists(select 1 from public.workout_completions c where c.session_schedule_id=schedule_id) then raise exception using errcode='40001',message='Completion already recorded'; end if;
  parent_ref:='INT-'||gen_random_uuid(); version_ref:='CMP-'||gen_random_uuid();
  insert into public.completion_intents(intent_ref,business_intent_ref,session_schedule_id,trainee_principal_id,client_evidence_context,status)
  values(parent_ref,new_ref,schedule_id,actor,coalesce(p_payload->'clientEvidenceContext','{}'),'CONFIRMED') returning id into existing_intent;
  insert into public.workout_completions(completion_ref,session_schedule_id,completion_intent_id,trainee_principal_id,completion_state,completed_at)
  values(version_ref,schedule_id,existing_intent,actor,jsonb_build_object('status','COMPLETED','source','trainee-submission'),now());
  update public.session_schedules set status='COMPLETED',updated_at=now() where id=schedule_id;
  outcome:=jsonb_build_object('intentRef',parent_ref,'completionRef',version_ref,'status','CONFIRMED'); refs:=jsonb_build_array(parent_ref,version_ref,p_payload->>'scheduleRef');
 when p_operation='p3s11_apin_019_post_1' then
  title:=p_payload->>'requestCategory';
  if title not in ('training','account','privacy','technical') or title is null then raise exception using errcode='22023',message='Invalid request category'; end if;
  reason:=cmh_private.text_field(p_payload->'minimumRoutingFacts','message',5,2000);
  perform cmh_private.require(cmh_private.allowed('CAP-006','RES-014',null,actor));
  new_ref:='SUP-'||gen_random_uuid();
  insert into public.support_privacy_cases(case_ref,principal_id,request_category,minimum_routing_facts,consent_purpose_context,status)
  values(new_ref,actor,title,jsonb_build_object('message',reason),jsonb_build_object('purpose','support-request'),'OPEN');
  outcome:=jsonb_build_object('caseRef',new_ref,'status','OPEN'); refs:=jsonb_build_array(new_ref);
 when p_operation in ('p3s11_apin_025_create_program_draft','p3s11_apin_025_revise_program_draft','p3s11_apin_025_create_session_draft','p3s11_apin_025_revise_session_draft') then
  is_program:=p_operation like '%program_draft'; is_revise:=p_operation like '%revise%';
  title:=cmh_private.text_field(p_payload,'title',2,160); reason:=cmh_private.text_field(p_payload,'reason',3,2000);
  if length(coalesce(p_payload->>'description',''))>8000 then raise exception using errcode='22023',message='Description too long'; end if;
  if is_revise then
    version_ref:=cmh_private.text_field(p_payload,'draftRef',1,200); expected:=(p_payload->>'expectedVersion')::bigint;
    if is_program then select d.id,d.program_ref as parent_ref,d.owner_coach_principal_id into v from public.program_versions ver join public.program_definitions d on d.id=ver.program_definition_id where ver.version_ref=version_ref for update of d;
    else select d.id,d.session_ref as parent_ref,d.owner_coach_principal_id into v from public.session_versions ver join public.session_definitions d on d.id=ver.session_definition_id where ver.version_ref=version_ref for update of d; end if;
    if not found then raise exception using errcode='P0002',message='Draft unavailable'; end if;
    parent_id:=v.id; parent_ref:=v.parent_ref; subject:=v.owner_coach_principal_id;
    if is_program then select max(version_number) into next_version from public.program_versions where program_definition_id=parent_id;
    else select max(version_number) into next_version from public.session_versions where session_definition_id=parent_id; end if;
    if expected is null or expected<>next_version then raise exception using errcode='40001',message='Draft version changed'; end if;
    next_version:=next_version+1;
  else
    subject:=actor; parent_ref:=(case when is_program then 'PRG-' else 'SES-' end)||gen_random_uuid(); next_version:=1;
    perform cmh_private.require(cmh_private.allowed('CAP-008','RES-009',null,actor));
    if is_program then insert into public.program_definitions(program_ref,owner_coach_principal_id,status,metadata) values(parent_ref,actor,'DRAFT',jsonb_build_object('title',title)) returning id into parent_id;
    else insert into public.session_definitions(session_ref,owner_coach_principal_id,status,metadata) values(parent_ref,actor,'DRAFT',jsonb_build_object('title',title)) returning id into parent_id; end if;
  end if;
  perform cmh_private.require(cmh_private.allowed('CAP-008','RES-009',parent_ref,subject));
  version_ref:='VER-'||gen_random_uuid();
  item:=jsonb_build_object('title',title,'description',coalesce(p_payload->>'description',''),'durationMinutes',coalesce((p_payload->>'durationMinutes')::int,30));
  if (item->>'durationMinutes')::int not between 1 and 1440 then raise exception using errcode='22023',message='Invalid duration'; end if;
  if is_program then insert into public.program_versions(program_definition_id,version_ref,version_number,status,definition,reason,created_by_principal_id) values(parent_id,version_ref,next_version,'DRAFT',item,reason,actor) returning id into version_id;
  else
   insert into public.session_versions(session_definition_id,version_ref,version_number,status,definition,reason,created_by_principal_id) values(parent_id,version_ref,next_version,'DRAFT',item,reason,actor) returning id into version_id;
   if jsonb_typeof(coalesce(p_payload->'exercises',p_payload->'exerciseRefs','[]'))<>'array' or jsonb_array_length(coalesce(p_payload->'exercises',p_payload->'exerciseRefs','[]'))>50 then raise exception using errcode='22023',message='Invalid exercises'; end if;
   i:=0;
   for item in select value from jsonb_array_elements(coalesce(p_payload->'exercises',p_payload->'exerciseRefs','[]')) loop
    i:=i+1; new_ref:=case when jsonb_typeof(item)='string' then item#>>'{}' else item->>'exerciseRef' end;
    select id into row_id from public.content_items where content_ref=new_ref;
    if not found then raise exception using errcode='P0002',message='Exercise unavailable'; end if;
    insert into public.session_exercise_links(link_ref,session_version_id,exercise_content_item_id,sequence_number,configuration)
    values('EXL-'||gen_random_uuid(),version_id,row_id,i,case when jsonb_typeof(item)='object' then item-'exerciseRef' else '{}'::jsonb end);
   end loop;
  end if;
  outcome:=jsonb_build_object(case when is_program then 'programRef' else 'sessionRef' end,parent_ref,'draftRef',version_ref,'versionRef',version_ref,'versionNumber',next_version,'status','DRAFT'); refs:=jsonb_build_array(parent_ref,version_ref);
 when p_operation in ('p3s11_apin_027_create_content_draft','p3s11_apin_027_revise_content_draft') then
  title:=cmh_private.text_field(p_payload,'title',2,160); reason:=cmh_private.text_field(p_payload,'reason',3,2000); locale:=coalesce(p_payload->>'locale','en');
  if locale not in ('en','ar') or length(coalesce(p_payload->>'instructions',''))>12000 or length(coalesce(p_payload->>'description',''))>8000 then raise exception using errcode='22023',message='Invalid content'; end if;
  if nullif(p_payload->>'videoUrl','') is not null and (p_payload->>'videoUrl' !~ '^https://[^/[:space:]]+' or length(p_payload->>'videoUrl')>2000) then raise exception using errcode='22023',message='Invalid video URL'; end if;
  if p_operation like '%revise%' then
   version_ref:=cmh_private.text_field(p_payload,'draftRef',1,200); expected:=(p_payload->>'expectedVersion')::bigint;
   select c.* into v from public.content_items c join public.content_versions ver on ver.content_item_id=c.id where ver.version_ref=version_ref for update of c;
   if not found then raise exception using errcode='P0002',message='Content draft unavailable'; end if;
   parent_id:=v.id; parent_ref:=v.content_ref; subject:=v.created_by_principal_id;
   select max(version_number) into next_version from public.content_versions where content_item_id=parent_id and content_versions.locale=run_command.locale;
   if expected is null or expected<>next_version then raise exception using errcode='40001',message='Content version changed'; end if; next_version:=next_version+1;
  else
   subject:=actor; perform cmh_private.require(cmh_private.allowed('CAP-009','RES-008',null,actor)); parent_ref:='CON-'||gen_random_uuid(); next_version:=1;
   insert into public.content_items(content_ref,content_kind,status,metadata,created_by_principal_id) values(parent_ref,'EXERCISE','DRAFT',jsonb_build_object('title',title),actor) returning id into parent_id;
  end if;
  perform cmh_private.require(cmh_private.allowed('CAP-009','RES-008',parent_ref,subject)); version_ref:='CV-'||gen_random_uuid();
  insert into public.content_versions(content_item_id,version_ref,version_number,locale,body,status,created_by_principal_id)
  values(parent_id,version_ref,next_version,locale,jsonb_build_object('title',title,'description',coalesce(p_payload->>'description',''),'instructions',coalesce(p_payload->'instructions','""'::jsonb),'videoUrl',nullif(p_payload->>'videoUrl',''),'changeReason',reason),'DRAFT',actor);
  outcome:=jsonb_build_object('contentRef',parent_ref,'draftRef',version_ref,'versionRef',version_ref,'versionNumber',next_version,'status','DRAFT'); refs:=jsonb_build_array(parent_ref,version_ref);
 when p_operation in ('p3s11_apin_028_post_1','p3s11_apin_037_post_1') then
  reason:=cmh_private.text_field(p_payload,'reason',3,2000); version_ref:=cmh_private.text_field(p_payload,'versionRef',1,200); decision:=p_payload->>'decision';
  if decision not in ('APPROVE','DENY') or decision is null then raise exception using errcode='22023',message='Invalid decision'; end if;
  at_time:=coalesce((p_payload->>'effectiveFrom')::timestamptz,now());
  if at_time>now() or at_time<now()-interval '5 minutes' then raise exception using errcode='22023',message='Publication must take effect now'; end if;
  if p_operation='p3s11_apin_028_post_1' then
   select ver.*,c.content_ref into v from public.content_versions ver join public.content_items c on c.id=ver.content_item_id where ver.version_ref=version_ref for update of ver,c;
   
   if not found then
    select ver.*,d.disclosure_ref into v from public.disclosure_versions ver join public.disclosure_documents d on d.id=ver.disclosure_document_id where ver.version_ref=version_ref for update of ver,d;
    if not found then raise exception using errcode='P0002',message='Publication version unavailable'; end if;
    perform cmh_private.require(cmh_private.allowed('CAP-010','RES-002',v.disclosure_ref,null) and v.created_by_principal_id is not null and v.created_by_principal_id<>actor);
    if v.status<>'DRAFT' then raise exception using errcode='40001',message='Disclosure version already decided'; end if;
    new_ref:='DDEC-'||gen_random_uuid();
    insert into public.disclosure_approval_decisions(decision_ref,disclosure_version_id,decision,actor_principal_id,reason) values(new_ref,v.id,decision,actor,reason);
    if decision='APPROVE' then
     update public.disclosure_versions set status='SUPERSEDED',effective_until=now() where disclosure_document_id=v.disclosure_document_id and disclosure_versions.locale=v.locale and status='PUBLISHED';
     update public.disclosure_versions set status='PUBLISHED',effective_from=now(),effective_until=null where id=v.id;
     update public.disclosure_documents set status='PUBLISHED',updated_at=now() where id=v.disclosure_document_id;
    else update public.disclosure_versions set status='REJECTED' where id=v.id; end if;
   else

   perform cmh_private.require(cmh_private.allowed('CAP-010','RES-008',v.content_ref,v.created_by_principal_id) and v.created_by_principal_id is distinct from actor);
   if v.status<>'DRAFT' then raise exception using errcode='40001',message='Content version already decided'; end if;
   new_ref:='DEC-'||gen_random_uuid();
   insert into public.content_approval_decisions(decision_ref,content_version_id,decision,actor_principal_id,reason,effective_at) values(new_ref,v.id,decision,actor,reason,now());
   if decision='APPROVE' then
    update public.content_versions set effective_until=now(),status='SUPERSEDED' where content_item_id=v.content_item_id and content_versions.locale=v.locale and status='PUBLISHED';
    update public.content_versions set status='PUBLISHED',effective_from=now(),effective_until=null where id=v.id;
    update public.content_items set status='PUBLISHED',updated_at=now() where id=v.content_item_id;
   else update public.content_versions set status='REJECTED' where id=v.id; end if;
   end if;
  else
   select * into v from public.policy_versions ver where ver.version_ref=version_ref for update;
   if not found then raise exception using errcode='P0002',message='Policy version unavailable'; end if;
   perform cmh_private.require(cmh_private.allowed('CAP-011','RES-015',version_ref,null) and v.created_by_principal_id is distinct from actor);
   if v.status<>'DRAFT' then raise exception using errcode='40001',message='Policy version already decided'; end if;
   new_ref:='PDEC-'||gen_random_uuid();
   insert into public.policy_approval_decisions(decision_ref,policy_version_id,decision,actor_principal_id,reason,effective_at) values(new_ref,v.id,decision,actor,reason,now());
   if decision='APPROVE' then
    update public.policy_versions set status='SUPERSEDED',effective_until=now() where policy_id=v.policy_id and status='PUBLISHED';
    update public.policy_versions set status='PUBLISHED',effective_from=now(),effective_until=null where id=v.id;
    update public.policies set status='PUBLISHED',updated_at=now() where id=v.policy_id;
   else update public.policy_versions set status='REJECTED' where id=v.id; end if;
  end if;
  outcome:=jsonb_build_object('decisionRef',new_ref,'versionRef',version_ref,'status',case decision when 'APPROVE' then 'PUBLISHED' else 'REJECTED' end); refs:=jsonb_build_array(new_ref,version_ref);
 when p_operation in ('p3s11_apin_029_post_1','p3s11_apin_030_post_1') then
  preview:=p_operation='p3s11_apin_029_post_1';
  parent_ref:=cmh_private.text_field(p_payload,'traineeRef',1,200); version_ref:=cmh_private.text_field(p_payload,'sessionVersionRef',1,200); reason:=cmh_private.text_field(p_payload,'reason',3,2000);
  
  at_time:=(p_payload->>'scheduledFor')::timestamptz;
  select ver.*,p.policy_ref into old from public.policy_versions ver join public.policies p on p.id=ver.policy_id
   where p.policy_kind='COACHING_TIME' and p.status='PUBLISHED' and ver.status='PUBLISHED'
   and (ver.effective_from is null or ver.effective_from<=now()) and (ver.effective_until is null or ver.effective_until>now());
  if not found or old.payload->>'timezone' is distinct from 'UTC' then raise exception using errcode='40001',message='Effective coaching-time policy required'; end if;
  if at_time is null or at_time<now()-make_interval(days=>(old.payload->>'allowPastDays')::int)-interval '1 minute' or at_time>now()+make_interval(days=>(old.payload->>'maxAdvanceDays')::int) then raise exception using errcode='22023',message='Schedule time outside effective policy'; end if;
  policy_snapshot:=jsonb_build_object('policyRef',old.policy_ref,'versionRef',old.version_ref,'payload',old.payload);

  select principal_id into subject from public.trainee_profiles where trainee_ref=parent_ref and status='ACTIVE';
  if not found then raise exception using errcode='P0002',message='Trainee unavailable'; end if;
  perform cmh_private.require(cmh_private.allowed('CAP-012','RES-010',null,subject));
  select ver.*,d.session_ref into v from public.session_versions ver join public.session_definitions d on d.id=ver.session_definition_id where ver.version_ref=version_ref for share of ver;
  if not found then raise exception using errcode='P0002',message='Session version unavailable'; end if;
  version_id:=v.id;
  if v.status not in ('DRAFT','READY','PUBLISHED') then raise exception using errcode='40001',message='Session version cannot be assigned'; end if;
  if not exists(select 1 from public.session_exercise_links where session_version_id=version_id) or exists(
   select 1 from public.session_exercise_links l where l.session_version_id=version_id and not exists(
    select 1 from public.content_versions c where c.content_item_id=l.exercise_content_item_id and c.status='PUBLISHED'
      and (c.effective_from is null or c.effective_from<=now()) and (c.effective_until is null or c.effective_until>now()))) then
   raise exception using errcode='40001',message='Every exercise needs effective approved content'; end if;
  if preview then return jsonb_build_object('status','READY','traineeRef',parent_ref,'sessionVersionRef',version_ref,'scheduledFor',at_time,'canRelease',true,'policySnapshot',policy_snapshot); end if;
  parent_ref:='ASN-'||gen_random_uuid(); new_ref:='SCH-'||gen_random_uuid(); version_ref:='REL-'||gen_random_uuid();
  insert into public.trainee_assignments(assignment_ref,trainee_principal_id,assigned_by_principal_id,session_version_id,status,scope)
   values(parent_ref,subject,actor,version_id,'ACTIVE',jsonb_build_object('reason',reason)) returning id into row_id;
  insert into public.session_schedules(schedule_ref,trainee_assignment_id,session_version_id,scheduled_for,status)
   values(new_ref,row_id,version_id,at_time,'RELEASED') returning id into second_id;
  insert into public.release_records(release_ref,trainee_assignment_id,session_schedule_id,released_by_principal_id,status,effective_at,evidence,policy_snapshot)
   values(version_ref,row_id,second_id,actor,'RELEASED',at_time,jsonb_build_object('reason',reason,'scheduledFor',at_time),policy_snapshot);
  outcome:=jsonb_build_object('assignmentRef',parent_ref,'scheduleRef',new_ref,'releaseRef',version_ref,'status','RELEASED'); refs:=jsonb_build_array(parent_ref,new_ref,version_ref);
 when p_operation in ('p3s11_apin_032_post_1','p3s11_apin_033_update_proposal') then
  reason:=cmh_private.text_field(p_payload,'reason',3,2000); item:=p_payload->'proposal';
  if jsonb_typeof(item) is distinct from 'object' or jsonb_typeof(item->'newState') is distinct from 'object' then raise exception using errcode='22023',message='Invalid correction proposal'; end if;
  version_ref:=cmh_private.text_field(item,'completionRef',1,200); expected:=(item->>'expectedVersion')::bigint;
  select * into old from public.workout_completions c where c.completion_ref=version_ref;
  if not found then raise exception using errcode='P0002',message='Completion unavailable'; end if;
  perform cmh_private.require(cmh_private.allowed('CAP-013','RES-012',version_ref,old.trainee_principal_id));
  if expected is null or old.authoritative_version<>expected then raise exception using errcode='40001',message='Completion version changed'; end if;
  if p_operation='p3s11_apin_032_post_1' then
   perform cmh_private.require(cmh_private.allowed('CAP-013','RES-013',null,old.trainee_principal_id)); parent_ref:='REC-'||gen_random_uuid(); next_version:=1;
   insert into public.reconciliation_cases(case_ref,opened_by_principal_id,status,affected_references,reason)
    values(parent_ref,actor,'OPEN',jsonb_build_array(version_ref),reason) returning id into row_id;
  else
   parent_ref:=cmh_private.text_field(p_payload,'caseRef',1,200);
   select * into v from public.reconciliation_cases where case_ref=parent_ref for update;
   if not found then raise exception using errcode='P0002',message='Case unavailable'; end if;
   perform cmh_private.require(cmh_private.allowed('CAP-013','RES-013',parent_ref,old.trainee_principal_id)); row_id:=v.id;
   if v.status<>'OPEN' then raise exception using errcode='40001',message='Case is closed'; end if;
   select max(version_number) into next_version from public.reconciliation_proposals where reconciliation_case_id=row_id;
   if (p_payload->>'expectedVersion')::integer is distinct from next_version then raise exception using errcode='40001',message='Proposal version changed'; end if; next_version:=next_version+1;
  end if;
  new_ref:='PROP-'||gen_random_uuid();
  insert into public.reconciliation_proposals(proposal_ref,reconciliation_case_id,version_number,proposal,reason,created_by_principal_id)
   values(new_ref,row_id,next_version,item,reason,actor);
  outcome:=jsonb_build_object('caseRef',parent_ref,'proposalRef',new_ref,'versionNumber',next_version,'status','OPEN'); refs:=jsonb_build_array(parent_ref,new_ref,version_ref);
 when p_operation='p3s11_apin_034_post_1' then
  parent_ref:=cmh_private.text_field(p_payload,'caseRef',1,200); version_ref:=cmh_private.text_field(p_payload,'proposalRef',1,200); reason:=cmh_private.text_field(p_payload,'reason',3,2000); decision:=p_payload->>'decision';
  if decision not in ('APPROVE','DENY') or decision is null then raise exception using errcode='22023',message='Invalid decision'; end if;
  select * into v from public.reconciliation_cases where case_ref=parent_ref for update;
  if not found then raise exception using errcode='P0002',message='Case unavailable'; end if;
  perform cmh_private.require(cmh_private.allowed('CAP-014','RES-013',parent_ref,cmh_private.completion_subject(v.affected_references->>0))); row_id:=v.id;
  if v.status<>'OPEN' then raise exception using errcode='40001',message='Case already decided'; end if;
  select * into old from public.reconciliation_proposals where reconciliation_case_id=row_id order by version_number desc limit 1;
  if not found or old.proposal_ref<>version_ref then raise exception using errcode='40001',message='Proposal is stale'; end if;
  perform cmh_private.require(old.created_by_principal_id is distinct from actor);
  second_id:=old.id; item:=old.proposal;
  select * into v from public.workout_completions where completion_ref=item->>'completionRef' for update;
  if not found then raise exception using errcode='P0002',message='Completion unavailable'; end if;
  perform cmh_private.require(cmh_private.allowed('CAP-014','RES-012',v.completion_ref,v.trainee_principal_id));
  if v.authoritative_version is distinct from (item->>'expectedVersion')::bigint then raise exception using errcode='40001',message='Completion version changed'; end if;
  new_ref:='AUTH-'||gen_random_uuid();
  insert into public.reconciliation_authorization_decisions(decision_ref,reconciliation_case_id,reconciliation_proposal_id,decision,actor_principal_id,reason)
   values(new_ref,row_id,second_id,decision,actor,reason);
  if decision='APPROVE' then update public.workout_completions set completion_state=item->'newState',authoritative_version=authoritative_version+1 where id=v.id; end if;
  update public.reconciliation_cases set status=case decision when 'APPROVE' then 'APPLIED' else 'DENIED' end,updated_at=now() where id=row_id;
  outcome:=jsonb_build_object('caseRef',parent_ref,'decisionRef',new_ref,'status',case decision when 'APPROVE' then 'APPLIED' else 'DENIED' end); refs:=jsonb_build_array(parent_ref,new_ref,v.completion_ref);
 when p_operation='p3s11_apin_035_post_1' then
  reason:=cmh_private.text_field(p_payload,'reason',3,2000); title:=p_payload->>'action';
  if title='REVOKE_GRANT' then
   new_ref:=cmh_private.text_field(p_payload,'grantRef',1,200);
   select * into v from public.principal_grants where grant_ref=new_ref for update;
   if not found then raise exception using errcode='P0002',message='Grant unavailable'; end if;
   subject:=v.principal_id;
   perform cmh_private.require(subject<>actor and cmh_private.allowed('CAP-015','RES-005',new_ref,subject));
   update public.principal_grants set revoked_at=coalesce(revoked_at,now()),revoked_by_principal_id=actor,revocation_evidence=jsonb_build_object('reason',reason) where id=v.id;
   outcome:=jsonb_build_object('grantRef',new_ref,'status','REVOKED');
  elsif title='GRANT' then
   parent_ref:=cmh_private.text_field(p_payload,'principalRef',1,200); select id into subject from public.app_principals where principal_ref=parent_ref and status='ACTIVE';
   if not found then raise exception using errcode='P0002',message='Principal unavailable'; end if;
   perform cmh_private.require(subject<>actor and cmh_private.allowed('CAP-015','RES-005',null,subject));
   -- Privileged authority may only be delegated by a current independent privileged approver.
   if coalesce(p_payload->>'roleId','') not in ('ROL-002','ROL-003','ROL-004') then
    perform cmh_private.require(exists(select 1 from public.principal_grants g where g.principal_id=actor and g.role_id='ROL-006' and g.capability_id='CAP-015' and g.resource_id='RES-005' and g.object_ref is null and g.subject_ref is null and g.revoked_at is null and g.valid_from<=now() and (g.valid_until is null or g.valid_until>now())));
   end if;
   if not exists(select 1 from public.role_catalog where role_id=p_payload->>'roleId') or not exists(select 1 from public.capability_catalog where capability_id=p_payload->>'capabilityId') or not exists(select 1 from public.resource_catalog where resource_id=p_payload->>'resourceId') then raise exception using errcode='22023',message='Invalid grant catalog values'; end if;
   -- Only role/capability tuples implemented by the capability authority are assignable.
   if not ((p_payload->>'roleId'='ROL-002' and p_payload->>'capabilityId' in ('CAP-002','CAP-003')) or
    (p_payload->>'roleId'='ROL-003' and p_payload->>'capabilityId' in ('CAP-002','CAP-003','CAP-004','CAP-005','CAP-006')) or
    (p_payload->>'roleId'='ROL-004' and p_payload->>'capabilityId' in ('CAP-002','CAP-003','CAP-006','CAP-007','CAP-008','CAP-009','CAP-012','CAP-013')) or
    (p_payload->>'roleId'='ROL-005' and p_payload->>'capabilityId'='CAP-015') or
    (p_payload->>'roleId'='ROL-006' and p_payload->>'capabilityId' in ('CAP-014','CAP-015')) or
    (p_payload->>'roleId'='ROL-007' and p_payload->>'capabilityId' in ('CAP-010','CAP-011')) or
    (p_payload->>'roleId'='ROL-008' and p_payload->>'capabilityId'='CAP-016') or
    (p_payload->>'roleId'='ROL-009' and p_payload->>'capabilityId'='CAP-017') or
    (p_payload->>'roleId'='ROL-010' and p_payload->>'capabilityId'='CAP-018') or
    (p_payload->>'roleId'='ROL-011' and p_payload->>'capabilityId'='CAP-019')) then raise exception using errcode='22023',message='Invalid role capability tuple'; end if;
   perform cmh_private.require(exists(select 1 from public.principal_grants admin_grant where admin_grant.principal_id=actor and admin_grant.role_id in ('ROL-005','ROL-006') and admin_grant.capability_id='CAP-015' and admin_grant.resource_id='RES-005' and admin_grant.revoked_at is null and admin_grant.valid_from<=now() and (admin_grant.valid_until is null or admin_grant.valid_until>now()) and (admin_grant.object_ref is null or admin_grant.object_ref=nullif(p_payload->>'objectRef','')) and (admin_grant.subject_ref is null or admin_grant.subject_ref=nullif(p_payload->>'subjectRef',''))));
   new_ref:='GRT-'||gen_random_uuid();
   insert into public.principal_grants(grant_ref,principal_id,role_id,capability_id,resource_id,object_ref,subject_ref,approved_by_principal_id,approval_evidence,valid_until)
    values(new_ref,subject,p_payload->>'roleId',p_payload->>'capabilityId',p_payload->>'resourceId',nullif(p_payload->>'objectRef',''),nullif(p_payload->>'subjectRef',''),actor,jsonb_build_object('reason',reason),nullif(p_payload->>'validUntil','')::timestamptz);
   if p_payload->>'roleId'='ROL-003' then insert into public.trainee_profiles(trainee_ref,principal_id,status,profile) values('TRN-'||gen_random_uuid(),subject,'ACTIVE','{}') on conflict(principal_id) do nothing;
   elsif p_payload->>'roleId'='ROL-004' then insert into public.coach_profiles(coach_ref,principal_id,status,profile) values('CCH-'||gen_random_uuid(),subject,'ACTIVE','{}') on conflict(principal_id) do nothing; end if;
   outcome:=jsonb_build_object('grantRef',new_ref,'principalRef',parent_ref,'status','ACTIVE');
  else raise exception using errcode='22023',message='Invalid authority action'; end if;
  refs:=jsonb_build_array(new_ref);
 when p_operation='p3s11_apin_039_patch_1' then
  parent_ref:=cmh_private.text_field(p_payload,'caseRef',1,200); reason:=cmh_private.text_field(p_payload,'reason',3,2000); title:=p_payload->>'status';
  if title not in ('IN_REVIEW','ESCALATED','RESOLVED') or title is null then raise exception using errcode='22023',message='Invalid case status'; end if;
  select * into v from public.support_privacy_cases where case_ref=parent_ref for update;
  if not found then raise exception using errcode='P0002',message='Case unavailable'; end if;
  perform cmh_private.require(cmh_private.allowed('CAP-016','RES-014',parent_ref,v.principal_id));
  if p_payload->>'expectedStatus' is distinct from v.status or v.status='RESOLVED' then raise exception using errcode='40001',message='Case state changed'; end if;
  if jsonb_typeof(coalesce(p_payload->'evidence','[]'))<>'array' or jsonb_array_length(coalesce(p_payload->'evidence','[]'))<1 then raise exception using errcode='22023',message='Invalid evidence'; end if;
  update public.support_privacy_cases set status=title,handler_scope=jsonb_build_object('handlerPrincipalId',actor,'reason',reason,'evidence',coalesce(p_payload->'evidence','[]')),updated_at=now() where id=v.id;
  outcome:=jsonb_build_object('caseRef',parent_ref,'status',title); refs:=jsonb_build_array(parent_ref);
 when p_operation='p3s11_apin_040_intake' then
  title:=p_payload->>'classificationRef'; reason:=cmh_private.text_field(p_payload->'evidence','summary',5,2000);
  if title not in ('availability','access','data-integrity','privacy','other') or title is null or jsonb_typeof(p_payload->'affectedReferences') is distinct from 'array' then raise exception using errcode='22023',message='Invalid incident'; end if;
  perform cmh_private.require(cmh_private.allowed('CAP-017','RES-016',null,null)); new_ref:='INC-'||gen_random_uuid();
  insert into public.operational_incidents(incident_ref,classification_ref,affected_references,detected_by_principal_id,status,evidence) values(new_ref,title,p_payload->'affectedReferences',actor,'OPEN',p_payload->'evidence');
  outcome:=jsonb_build_object('incidentRef',new_ref,'status','OPEN'); refs:=jsonb_build_array(new_ref);
 when p_operation='p3s11_apin_041_post_1' then
  parent_ref:=cmh_private.text_field(p_payload,'incidentRef',1,200); reason:=cmh_private.text_field(p_payload->'activityIntent','reason',5,2000); title:=p_payload->'activityIntent'->>'category';
  if title not in ('investigation','restoration','verification') or title is null then raise exception using errcode='22023',message='Invalid recovery category'; end if;
  perform cmh_private.text_field(p_payload->'evidence','summary',5,2000);
  if jsonb_typeof(p_payload->'evidence'->'references') is distinct from 'array' or jsonb_array_length(p_payload->'evidence'->'references')<1 then raise exception using errcode='22023',message='Evidence references required'; end if;
  select * into v from public.operational_incidents where incident_ref=parent_ref for update;
  if not found then raise exception using errcode='P0002',message='Incident unavailable'; end if;
  perform cmh_private.require(cmh_private.allowed('CAP-017','RES-016',parent_ref,null) and cmh_private.allowed('CAP-017','RES-017',null,null));
  if v.status='CLOSED' then raise exception using errcode='40001',message='Incident is closed'; end if;
  new_ref:='RCV-'||gen_random_uuid();
  insert into public.recovery_activities(recovery_activity_ref,operational_incident_id,initiated_by_principal_id,status,activity_intent,evidence)
   values(new_ref,v.id,actor,'RECORDED',p_payload->'activityIntent',p_payload->'evidence');
  outcome:=jsonb_build_object('recoveryActivityRef',new_ref,'status','RECORDED'); refs:=jsonb_build_array(parent_ref,new_ref);
 when p_operation='p3s11_apin_042_submit_validation' then
  parent_ref:=cmh_private.text_field(p_payload,'recoveryActivityRef',1,200); title:=p_payload->>'result';
  if title not in ('PASS','FAIL','INCONCLUSIVE') or title is null then raise exception using errcode='22023',message='Invalid validation result'; end if;
  perform cmh_private.text_field(p_payload->'evidence','summary',5,2000);
  if jsonb_typeof(p_payload->'evidence'->'references') is distinct from 'array' or jsonb_array_length(p_payload->'evidence'->'references')<1 then raise exception using errcode='22023',message='Evidence references required'; end if;
  select * into v from public.recovery_activities where recovery_activity_ref=parent_ref for share;
  if not found then raise exception using errcode='P0002',message='Recovery activity unavailable'; end if;
  perform cmh_private.require(cmh_private.allowed('CAP-018','RES-017',parent_ref,null) and v.initiated_by_principal_id is distinct from actor);
  new_ref:='VAL-'||gen_random_uuid();
  insert into public.recovery_validations(validation_ref,recovery_activity_id,validator_principal_id,result,evidence) values(new_ref,v.id,actor,title,p_payload->'evidence');
  outcome:=jsonb_build_object('validationRef',new_ref,'result',title,'status','VALIDATED'); refs:=jsonb_build_array(parent_ref,new_ref);
 when p_operation='p3s11_apin_043_post_1' then
  parent_ref:=cmh_private.text_field(p_payload,'validationRef',1,200); reason:=cmh_private.text_field(p_payload,'reason',5,2000);
  if jsonb_typeof(p_payload->'targetReferences') is distinct from 'array' or jsonb_array_length(p_payload->'targetReferences')<1 then raise exception using errcode='22023',message='Invalid handoff targets'; end if;
  select * into v from public.recovery_validations where validation_ref=parent_ref for share;
  if not found then raise exception using errcode='P0002',message='Validation unavailable'; end if;
  perform cmh_private.require(cmh_private.validation_permission(v.id,'CAP-018'));
  if v.result<>'PASS' then raise exception using errcode='40001',message='Passing validation required'; end if;
  if exists(select 1 from jsonb_array_elements_text(p_payload->'targetReferences') t(ref) where not exists(select 1 from public.recovery_activities a join public.operational_incidents i on i.id=a.operational_incident_id where a.id=v.recovery_activity_id and i.affected_references ? t.ref)) then raise exception using errcode='42501',message='Handoff target outside incident scope'; end if;
  new_ref:='HND-'||gen_random_uuid();
  insert into public.state_reconciliation_handoffs(handoff_ref,recovery_validation_id,target_references,status) values(new_ref,v.id,p_payload->'targetReferences','PENDING');
  outcome:=jsonb_build_object('handoffRef',new_ref,'status','PENDING'); refs:=jsonb_build_array(parent_ref,new_ref);
 else raise exception using errcode='22023',message='Unsupported command';
 end case;
 insert into public.audit_events(event_ref,actor_principal_id,action,category,object_references,result,reason,evidence,after_data)
 values(event_ref,actor,p_operation,'APPLICATION_COMMAND',refs,'COMMITTED',reason,jsonb_build_object('source','cmh_command'),outcome);
 outcome:=outcome||jsonb_build_object('eventRef',event_ref);
 if intent_key is not null then insert into cmh_private.command_intents(actor_principal_id,operation_id,business_intent_ref,request_payload,response_payload) values(actor,p_operation,intent_key,p_payload,outcome); end if;
 return outcome;
end $$;
grant create on schema cmh_private to cmh_runtime;
alter function cmh_private.run_command(text,jsonb) owner to cmh_runtime;
revoke create on schema cmh_private from cmh_runtime;
revoke all on function cmh_private.run_command(text,jsonb) from public,anon;
grant execute on function cmh_private.run_command(text,jsonb) to authenticated;
grant execute on function cmh_private.require(boolean),cmh_private.text_field(jsonb,text,integer,integer) to cmh_runtime;
revoke all on function cmh_private.require(boolean),cmh_private.text_field(jsonb,text,integer,integer) from public,anon,authenticated;
create function public.cmh_command(p_operation text,p_payload jsonb) returns jsonb
language sql volatile security invoker set search_path='' as $$ select cmh_private.run_command(p_operation,p_payload) $$;
revoke all on function public.cmh_command(text,jsonb) from public,anon;
grant execute on function public.cmh_command(text,jsonb) to authenticated;

-- Explicit public scope: published private coaching exercises remain private.
create function cmh_private.public_content(p_item uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.content_items c join public.content_versions v on v.content_item_id=c.id
 where c.id=p_item and c.content_kind in ('PUBLIC_GUIDANCE','PUBLIC_OVERVIEW','PUBLIC_NEXT_STEP') and v.status='PUBLISHED'
 and (v.effective_from is null or v.effective_from<=now()) and (v.effective_until is null or v.effective_until>now()))
$$;
create or replace function cmh_private.content_read(p_item uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select cmh_private.public_content(p_item) or (auth.uid() is not null and exists(select 1 from public.content_items c where c.id=p_item and (
 cmh_private.allowed('CAP-009','RES-008',c.content_ref,c.created_by_principal_id)
 or cmh_private.allowed('CAP-010','RES-008',c.content_ref,c.created_by_principal_id)
 or exists(select 1 from public.session_exercise_links l join public.session_schedules s on s.session_version_id=l.session_version_id
  join public.trainee_assignments a on a.id=s.trainee_assignment_id where (l.exercise_content_item_id=c.id or l.guidance_content_item_id=c.id)
   and a.trainee_principal_id=cmh_private.principal_id() and cmh_private.schedule_read(s.id)
   and cmh_private.allowed('CAP-004','RES-008',c.content_ref,a.trainee_principal_id)))))
$$;
revoke all on function cmh_private.public_content(uuid) from public;
grant execute on function cmh_private.public_content(uuid) to anon,authenticated,cmh_runtime;
drop policy public_effective_content_read on public.content_versions;
create policy public_effective_content_read on public.content_versions for select to anon,authenticated,cmh_runtime
using(status='PUBLISHED' and (effective_from is null or effective_from<=now()) and (effective_until is null or effective_until>now()) and cmh_private.public_content(content_item_id));
create policy assigned_effective_content_read on public.content_versions for select to authenticated,cmh_runtime
using(status='PUBLISHED' and (effective_from is null or effective_from<=now()) and (effective_until is null or effective_until>now()) and cmh_private.content_read(content_item_id));
grant select on public.content_items to anon;
create policy public_content_items_read on public.content_items for select to anon using(cmh_private.public_content(id));
alter policy public_effective_disclosure_read on public.disclosure_versions to anon,authenticated,cmh_runtime;
-- Training drafts do not need a release record to be written by their authorized coach.
create policy command_schedules_read on public.session_schedules for select to cmh_runtime using(exists(select 1 from public.trainee_assignments a where a.id=trainee_assignment_id and cmh_private.allowed('CAP-012','RES-010',schedule_ref,a.trainee_principal_id)));
create policy command_release_read on public.release_records for select to cmh_runtime using(exists(select 1 from public.trainee_assignments a where a.id=trainee_assignment_id and cmh_private.allowed('CAP-012','RES-010',release_ref,a.trainee_principal_id)));
notify pgrst,'reload schema';

revoke select on public.support_privacy_cases from authenticated;
grant select(case_ref,principal_id,request_category,minimum_routing_facts,status,created_at,updated_at) on public.support_privacy_cases to authenticated;
grant update(id) on public.disclosure_versions to cmh_runtime;
create policy command_notice_lock on public.disclosure_versions for update to cmh_runtime using(status='PUBLISHED') with check(false);
create policy runtime_role_catalog_read on public.role_catalog for select to cmh_runtime using(true);
create policy runtime_capability_catalog_read on public.capability_catalog for select to cmh_runtime using(true);
create policy runtime_resource_catalog_read on public.resource_catalog for select to cmh_runtime using(true);
-- INSERT ... RETURNING must be authorized against the inserted row, not a pre-insert helper snapshot.
create policy command_content_items_read on public.content_items for select to cmh_runtime using(cmh_private.allowed('CAP-009','RES-008',content_ref,created_by_principal_id) or cmh_private.allowed('CAP-010','RES-008',content_ref,created_by_principal_id));
create policy command_program_versions_read on public.program_versions for select to cmh_runtime using(exists(select 1 from public.program_definitions d where d.id=program_definition_id and cmh_private.allowed('CAP-008','RES-009',d.program_ref,d.owner_coach_principal_id)));
create policy command_session_versions_read on public.session_versions for select to cmh_runtime using(exists(select 1 from public.session_definitions d where d.id=session_definition_id and cmh_private.allowed('CAP-008','RES-009',d.session_ref,d.owner_coach_principal_id)));
create policy command_reconciliation_cases_read on public.reconciliation_cases for select to cmh_runtime using(cmh_private.allowed('CAP-013','RES-013',case_ref,cmh_private.completion_subject(affected_references->>0)) or cmh_private.allowed('CAP-014','RES-013',case_ref,cmh_private.completion_subject(affected_references->>0)));
create function cmh_private.definition_read(p_definition uuid,p_kind text) returns boolean
language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and (
  exists(select 1 from public.session_versions v where p_kind='session' and v.session_definition_id=p_definition and cmh_private.training_read(v.id,'session'))
  or exists(select 1 from public.program_versions v where p_kind='program' and v.program_definition_id=p_definition and cmh_private.training_read(v.id,'program')))
$$;
revoke all on function cmh_private.definition_read(uuid,text) from public,anon;
grant execute on function cmh_private.definition_read(uuid,text) to authenticated,cmh_runtime;
alter policy runtime_program_definitions_read on public.program_definitions using(cmh_private.allowed('CAP-008','RES-009',program_ref,owner_coach_principal_id) or cmh_private.definition_read(id,'program'));
alter policy runtime_session_definitions_read on public.session_definitions using(cmh_private.allowed('CAP-008','RES-009',session_ref,owner_coach_principal_id) or cmh_private.definition_read(id,'session'));
alter policy runtime_disclosure_documents_read on public.disclosure_documents using(exists(select 1 from public.disclosure_versions v where v.disclosure_document_id=disclosure_documents.id and v.status='PUBLISHED') or cmh_private.allowed('CAP-010','RES-002',disclosure_ref,null));
-- Row locks on immutable evidence need UPDATE privilege, but no update is ever permitted.
grant update(id) on public.recovery_activities,public.recovery_validations to cmh_runtime;
create policy command_recovery_activity_lock on public.recovery_activities for update to cmh_runtime using(cmh_private.allowed('CAP-017','RES-017',recovery_activity_ref,null) or cmh_private.allowed('CAP-018','RES-017',recovery_activity_ref,null)) with check(false);
create policy command_recovery_validation_lock on public.recovery_validations for update to cmh_runtime using(cmh_private.allowed('CAP-017','RES-017',validation_ref,null) or cmh_private.allowed('CAP-018','RES-017',validation_ref,null)) with check(false);
create function public.cmh_permission_checks(p_checks jsonb) returns jsonb
language plpgsql stable security invoker set search_path='' as $$
declare item jsonb; result jsonb:='{}'; check_key text;
begin
 if auth.uid() is null or jsonb_typeof(p_checks) is distinct from 'array' or jsonb_array_length(p_checks)>200 then raise exception using errcode='22023',message='Invalid permission check request'; end if;
 for item in select value from jsonb_array_elements(p_checks) loop
  check_key:=item->>'key';
  if check_key is null or length(check_key)>200 or check_key='' then raise exception using errcode='22023',message='Invalid permission check key'; end if;
  result:=result||jsonb_build_object(check_key,cmh_private.allowed(item->>'capabilityId',item->>'resourceId',nullif(item->>'objectRef',''),nullif(item->>'subjectId','')::uuid));
 end loop;
 return result;
end $$;
revoke all on function public.cmh_permission_checks(jsonb) from public,anon;
grant execute on function public.cmh_permission_checks(jsonb) to authenticated;
-- Scheduling configuration is global; a subject-scoped scheduler may read the effective policy.
create function cmh_private.scheduler_policy_read(p_ref text) returns boolean
language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.principal_grants g where g.principal_id=cmh_private.principal_id() and g.capability_id='CAP-012' and g.resource_id='RES-015' and cmh_private.allowed('CAP-012','RES-015',p_ref,cmh_private.resolve_subject(g.subject_ref)))
$$;
revoke all on function cmh_private.scheduler_policy_read(text) from public,anon;
grant execute on function cmh_private.scheduler_policy_read(text) to authenticated,cmh_runtime;
create policy scheduler_effective_policy_read on public.policies for select to authenticated,cmh_runtime using(status='PUBLISHED' and cmh_private.scheduler_policy_read(policy_ref));
create policy scheduler_effective_policy_version_read on public.policy_versions for select to authenticated,cmh_runtime using(status='PUBLISHED' and (effective_from is null or effective_from<=now()) and (effective_until is null or effective_until>now()) and cmh_private.scheduler_policy_read(version_ref));
create function cmh_private.activity_permission(p_id uuid,p_cap text) returns boolean
language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.recovery_activities a join public.operational_incidents i on i.id=a.operational_incident_id where a.id=p_id and
 (cmh_private.allowed(p_cap,'RES-017',a.recovery_activity_ref,null) or (p_cap='CAP-017' and cmh_private.allowed('CAP-017','RES-016',i.incident_ref,null))))
$$;
create function cmh_private.validation_permission(p_id uuid,p_cap text) returns boolean
language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.recovery_validations v where v.id=p_id and
 (cmh_private.allowed(p_cap,'RES-017',v.validation_ref,null) or cmh_private.activity_permission(v.recovery_activity_id,p_cap)))
$$;
create function cmh_private.incident_read(p_id uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.operational_incidents i where i.id=p_id and
 (cmh_private.allowed('CAP-017','RES-016',i.incident_ref,null) or cmh_private.allowed('CAP-018','RES-016',i.incident_ref,null)
 or exists(select 1 from public.recovery_activities a where a.operational_incident_id=i.id and cmh_private.allowed('CAP-018','RES-017',a.recovery_activity_ref,null))))
$$;
revoke all on function cmh_private.activity_permission(uuid,text),cmh_private.validation_permission(uuid,text),cmh_private.incident_read(uuid) from public,anon;
grant execute on function cmh_private.activity_permission(uuid,text),cmh_private.validation_permission(uuid,text),cmh_private.incident_read(uuid) to authenticated,cmh_runtime;
create policy incident_relation_read on public.operational_incidents for select to authenticated,cmh_runtime using(cmh_private.incident_read(id));
create policy activity_relation_read on public.recovery_activities for select to authenticated,cmh_runtime using(cmh_private.activity_permission(id,'CAP-017') or cmh_private.activity_permission(id,'CAP-018'));
create policy validation_relation_read on public.recovery_validations for select to authenticated,cmh_runtime using(cmh_private.validation_permission(id,'CAP-017') or cmh_private.validation_permission(id,'CAP-018'));
create policy handoff_relation_read on public.state_reconciliation_handoffs for select to authenticated,cmh_runtime using(cmh_private.validation_permission(recovery_validation_id,'CAP-017') or cmh_private.validation_permission(recovery_validation_id,'CAP-018'));
create policy validation_scoped_insert on public.recovery_validations for insert to cmh_runtime with check(validator_principal_id=cmh_private.principal_id() and cmh_private.activity_permission(recovery_activity_id,'CAP-018'));
create policy handoff_scoped_insert on public.state_reconciliation_handoffs for insert to cmh_runtime with check(cmh_private.validation_permission(recovery_validation_id,'CAP-018'));
alter policy command_recovery_activity_lock on public.recovery_activities using(cmh_private.activity_permission(id,'CAP-017') or cmh_private.activity_permission(id,'CAP-018'));
alter policy command_recovery_validation_lock on public.recovery_validations using(cmh_private.validation_permission(id,'CAP-017') or cmh_private.validation_permission(id,'CAP-018'));
create function cmh_private.disclosure_document_permission(p_id uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.disclosure_documents d where d.id=p_id and cmh_private.allowed('CAP-010','RES-002',d.disclosure_ref,null))
$$;
create function cmh_private.disclosure_version_permission(p_id uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.disclosure_versions v where v.id=p_id and (cmh_private.allowed('CAP-010','RES-002',v.version_ref,null) or cmh_private.disclosure_document_permission(v.disclosure_document_id)))
$$;
revoke all on function cmh_private.disclosure_document_permission(uuid),cmh_private.disclosure_version_permission(uuid) from public,anon;
grant execute on function cmh_private.disclosure_document_permission(uuid),cmh_private.disclosure_version_permission(uuid) to authenticated,cmh_runtime;
alter policy runtime_disclosure_versions_read on public.disclosure_versions using(cmh_private.allowed('CAP-010','RES-002',version_ref,null) or cmh_private.disclosure_document_permission(disclosure_document_id));
create policy disclosure_parent_insert on public.disclosure_versions for insert to cmh_runtime with check(cmh_private.disclosure_document_permission(disclosure_document_id));
create policy disclosure_parent_update on public.disclosure_versions for update to cmh_runtime using(cmh_private.disclosure_document_permission(disclosure_document_id)) with check(cmh_private.disclosure_document_permission(disclosure_document_id));
create policy disclosure_decisions_scoped_read on public.disclosure_approval_decisions for select to authenticated,cmh_runtime using(cmh_private.disclosure_version_permission(disclosure_version_id));
create policy disclosure_decisions_scoped_insert on public.disclosure_approval_decisions for insert to cmh_runtime with check(actor_principal_id=cmh_private.principal_id() and cmh_private.disclosure_version_permission(disclosure_version_id));
create function cmh_private.content_version_approve(p_id uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.content_versions v join public.content_items c on c.id=v.content_item_id where v.id=p_id and cmh_private.allowed('CAP-010','RES-008',c.content_ref,c.created_by_principal_id))
$$;
revoke all on function cmh_private.content_version_approve(uuid) from public,anon;
grant execute on function cmh_private.content_version_approve(uuid) to authenticated,cmh_runtime;
create policy content_decisions_scoped_insert on public.content_approval_decisions for insert to cmh_runtime with check(actor_principal_id=cmh_private.principal_id() and cmh_private.content_version_approve(content_version_id));
-- Raw provider evidence is never a public/client column. Runtime commands retain full access.
revoke select on public.disclosure_versions from anon,authenticated;
grant select(id,disclosure_document_id,version_ref,version_number,locale,body,status,effective_from,effective_until,created_at) on public.disclosure_versions to anon,authenticated;
grant select(created_by_principal_id) on public.disclosure_versions to authenticated;
revoke select on public.content_versions from anon;
grant select(id,content_item_id,version_ref,version_number,locale,body,status,effective_from,effective_until,created_at) on public.content_versions to anon;
create function cmh_private.content_version_manage(p_id uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.content_versions v join public.content_items c on c.id=v.content_item_id where v.id=p_id and
 (cmh_private.allowed('CAP-009','RES-008',c.content_ref,c.created_by_principal_id) or cmh_private.allowed('CAP-010','RES-008',c.content_ref,c.created_by_principal_id)))
$$;
revoke all on function cmh_private.content_version_manage(uuid) from public,anon;
grant execute on function cmh_private.content_version_manage(uuid) to authenticated,cmh_runtime;
alter policy runtime_content_approval_decisions_read on public.content_approval_decisions using(cmh_private.content_version_manage(content_version_id));

-- Auth owns identity verification. A new identity receives no application authority.
-- Trigger functions cannot be called as ordinary RPCs; this privileged function is trigger-only.
create function cmh_private.register_auth_principal() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 insert into public.app_principals(principal_ref,auth_user_id,principal_kind,status)
 values('PRN-'||gen_random_uuid(),new.id,'USER','ACTIVE') on conflict(auth_user_id) do nothing;
 return new;
end $$;
revoke all on function cmh_private.register_auth_principal() from public,anon,authenticated,cmh_runtime;
create trigger cmh_register_auth_principal after insert on auth.users for each row execute function cmh_private.register_auth_principal();

grant insert on public.trainee_profiles,public.coach_profiles to cmh_runtime;
create policy administrator_trainee_profile_insert on public.trainee_profiles for insert to cmh_runtime with check(exists(select 1 from public.app_principals p where p.id=principal_id and cmh_private.allowed('CAP-015','RES-004',p.principal_ref,p.id)));
create policy administrator_coach_profile_insert on public.coach_profiles for insert to cmh_runtime with check(exists(select 1 from public.app_principals p where p.id=principal_id and cmh_private.allowed('CAP-015','RES-004',p.principal_ref,p.id)));
create policy administrator_trainee_profile_read on public.trainee_profiles for select to authenticated,cmh_runtime using(exists(select 1 from public.app_principals p where p.id=principal_id and cmh_private.allowed('CAP-015','RES-004',p.principal_ref,p.id)));
create policy administrator_coach_profile_read on public.coach_profiles for select to authenticated,cmh_runtime using(exists(select 1 from public.app_principals p where p.id=principal_id and cmh_private.allowed('CAP-015','RES-004',p.principal_ref,p.id)));
