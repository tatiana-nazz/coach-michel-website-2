create table public.trainee_profiles (
  id uuid primary key default gen_random_uuid(),
  trainee_ref text not null unique check (btrim(trainee_ref) <> ''),
  principal_id uuid not null unique references public.app_principals(id) on delete cascade,
  status text not null,
  profile jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.coach_profiles (
  id uuid primary key default gen_random_uuid(),
  coach_ref text not null unique check (btrim(coach_ref) <> ''),
  principal_id uuid not null unique references public.app_principals(id) on delete cascade,
  status text not null,
  profile jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.program_definitions (
  id uuid primary key default gen_random_uuid(),
  program_ref text not null unique check (btrim(program_ref) <> ''),
  owner_coach_principal_id uuid references public.app_principals(id) on delete set null,
  status text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.program_versions (
  id uuid primary key default gen_random_uuid(),
  program_definition_id uuid not null references public.program_definitions(id) on delete cascade,
  version_ref text not null unique check (btrim(version_ref) <> ''),
  version_number integer not null check (version_number > 0),
  status text not null,
  definition jsonb not null default '{}'::jsonb,
  reason text,
  created_by_principal_id uuid references public.app_principals(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (program_definition_id, version_number)
);

create table public.session_definitions (
  id uuid primary key default gen_random_uuid(),
  session_ref text not null unique check (btrim(session_ref) <> ''),
  program_definition_id uuid references public.program_definitions(id) on delete set null,
  owner_coach_principal_id uuid references public.app_principals(id) on delete set null,
  status text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.session_versions (
  id uuid primary key default gen_random_uuid(),
  session_definition_id uuid not null references public.session_definitions(id) on delete cascade,
  version_ref text not null unique check (btrim(version_ref) <> ''),
  version_number integer not null check (version_number > 0),
  status text not null,
  definition jsonb not null default '{}'::jsonb,
  reason text,
  created_by_principal_id uuid references public.app_principals(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (session_definition_id, version_number)
);

create table public.session_exercise_links (
  id uuid primary key default gen_random_uuid(),
  link_ref text not null unique check (btrim(link_ref) <> ''),
  session_version_id uuid not null references public.session_versions(id) on delete cascade,
  exercise_content_item_id uuid not null references public.content_items(id) on delete restrict,
  guidance_content_item_id uuid references public.content_items(id) on delete set null,
  sequence_number integer not null check (sequence_number > 0),
  configuration jsonb not null default '{}'::jsonb,
  unique (session_version_id, sequence_number)
);

create table public.trainee_assignments (
  id uuid primary key default gen_random_uuid(),
  assignment_ref text not null unique check (btrim(assignment_ref) <> ''),
  trainee_principal_id uuid not null references public.app_principals(id) on delete cascade,
  assigned_by_principal_id uuid references public.app_principals(id) on delete set null,
  program_version_id uuid references public.program_versions(id) on delete restrict,
  session_version_id uuid references public.session_versions(id) on delete restrict,
  scope jsonb not null default '{}'::jsonb,
  status text not null,
  assigned_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (program_version_id is not null or session_version_id is not null)
);

create table public.session_schedules (
  id uuid primary key default gen_random_uuid(),
  schedule_ref text not null unique check (btrim(schedule_ref) <> ''),
  trainee_assignment_id uuid not null references public.trainee_assignments(id) on delete cascade,
  session_version_id uuid not null references public.session_versions(id) on delete restrict,
  scheduled_for timestamptz,
  status text not null,
  schedule_context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.release_records (
  id uuid primary key default gen_random_uuid(),
  release_ref text not null unique check (btrim(release_ref) <> ''),
  trainee_assignment_id uuid references public.trainee_assignments(id) on delete cascade,
  session_schedule_id uuid references public.session_schedules(id) on delete cascade,
  released_by_principal_id uuid references public.app_principals(id) on delete set null,
  status text not null,
  effective_at timestamptz not null,
  policy_snapshot jsonb not null default '{}'::jsonb,
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (trainee_assignment_id is not null or session_schedule_id is not null)
);

create table public.completion_intents (
  id uuid primary key default gen_random_uuid(),
  intent_ref text not null unique check (btrim(intent_ref) <> ''),
  business_intent_ref text not null unique check (btrim(business_intent_ref) <> ''),
  session_schedule_id uuid not null references public.session_schedules(id) on delete restrict,
  trainee_principal_id uuid not null references public.app_principals(id) on delete restrict,
  client_evidence_context jsonb not null default '{}'::jsonb,
  status text not null,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workout_completions (
  id uuid primary key default gen_random_uuid(),
  completion_ref text not null unique check (btrim(completion_ref) <> ''),
  session_schedule_id uuid not null references public.session_schedules(id) on delete restrict,
  completion_intent_id uuid unique references public.completion_intents(id) on delete set null,
  trainee_principal_id uuid not null references public.app_principals(id) on delete restrict,
  completion_state jsonb not null default '{}'::jsonb,
  authoritative_version bigint not null default 1 check (authoritative_version > 0),
  completed_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.derived_status_projections (
  id uuid primary key default gen_random_uuid(),
  projection_ref text not null unique check (btrim(projection_ref) <> ''),
  subject_type text not null check (btrim(subject_type) <> ''),
  subject_ref text not null check (btrim(subject_ref) <> ''),
  projection_kind text not null check (btrim(projection_kind) <> ''),
  projection jsonb not null default '{}'::jsonb,
  source_version_ref text,
  rebuilt_at timestamptz not null default now(),
  unique (subject_type, subject_ref, projection_kind)
);

create index trainee_assignments_lookup_idx on public.trainee_assignments (trainee_principal_id, status);
create index session_schedules_lookup_idx on public.session_schedules (trainee_assignment_id, scheduled_for, status);
create index release_records_effective_idx on public.release_records (effective_at, status);
create index completion_intents_schedule_idx on public.completion_intents (session_schedule_id, submitted_at);
create index workout_completions_schedule_idx on public.workout_completions (session_schedule_id, completed_at);
create index derived_status_subject_idx on public.derived_status_projections (subject_type, subject_ref);
