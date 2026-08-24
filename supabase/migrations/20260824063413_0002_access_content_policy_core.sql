create table public.access_provisioning_records (
  id uuid primary key default gen_random_uuid(),
  provisioning_ref text not null unique check (btrim(provisioning_ref) <> ''),
  principal_id uuid references public.app_principals(id) on delete set null,
  target_identity_ref text not null check (btrim(target_identity_ref) <> ''),
  requested_role_ids jsonb not null default '[]'::jsonb,
  requested_scope jsonb not null default '{}'::jsonb,
  status text not null,
  evidence jsonb not null default '{}'::jsonb,
  expires_at timestamptz,
  created_by_principal_id uuid references public.app_principals(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.access_recovery_requests (
  id uuid primary key default gen_random_uuid(),
  recovery_request_ref text not null unique check (btrim(recovery_request_ref) <> ''),
  principal_id uuid references public.app_principals(id) on delete set null,
  identity_context jsonb not null default '{}'::jsonb,
  minimum_routing_facts jsonb not null default '{}'::jsonb,
  status text not null,
  evidence jsonb not null default '{}'::jsonb,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.account_preferences (
  principal_id uuid primary key references public.app_principals(id) on delete cascade,
  locale text not null default 'en' check (locale in ('en', 'ar')),
  notice_context jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.content_items (
  id uuid primary key default gen_random_uuid(),
  content_ref text not null unique check (btrim(content_ref) <> ''),
  content_kind text not null check (btrim(content_kind) <> ''),
  category_ref text,
  status text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_by_principal_id uuid references public.app_principals(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.content_versions (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  version_ref text not null unique check (btrim(version_ref) <> ''),
  version_number integer not null check (version_number > 0),
  locale text not null default 'en' check (locale in ('en', 'ar')),
  body jsonb not null default '{}'::jsonb,
  status text not null,
  effective_from timestamptz,
  effective_until timestamptz,
  created_by_principal_id uuid references public.app_principals(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (content_item_id, version_number, locale),
  check (effective_until is null or effective_from is null or effective_until > effective_from)
);

create table public.content_approval_decisions (
  id uuid primary key default gen_random_uuid(),
  decision_ref text not null unique check (btrim(decision_ref) <> ''),
  content_version_id uuid not null references public.content_versions(id) on delete restrict,
  decision text not null check (decision in ('APPROVE', 'DENY')),
  actor_principal_id uuid references public.app_principals(id) on delete set null,
  reason text not null check (btrim(reason) <> ''),
  evidence jsonb not null default '{}'::jsonb,
  effective_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.disclosure_documents (
  id uuid primary key default gen_random_uuid(),
  disclosure_ref text not null unique check (btrim(disclosure_ref) <> ''),
  disclosure_kind text not null check (btrim(disclosure_kind) <> ''),
  status text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.disclosure_versions (
  id uuid primary key default gen_random_uuid(),
  disclosure_document_id uuid not null references public.disclosure_documents(id) on delete cascade,
  version_ref text not null unique check (btrim(version_ref) <> ''),
  version_number integer not null check (version_number > 0),
  locale text not null default 'en' check (locale in ('en', 'ar')),
  body jsonb not null default '{}'::jsonb,
  provider_evidence jsonb not null default '{}'::jsonb,
  status text not null,
  effective_from timestamptz,
  effective_until timestamptz,
  created_at timestamptz not null default now(),
  unique (disclosure_document_id, version_number, locale),
  check (effective_until is null or effective_from is null or effective_until > effective_from)
);

create table public.acceptance_records (
  id uuid primary key default gen_random_uuid(),
  acceptance_ref text not null unique check (btrim(acceptance_ref) <> ''),
  principal_id uuid not null references public.app_principals(id) on delete cascade,
  disclosure_version_id uuid not null references public.disclosure_versions(id) on delete restrict,
  decision text not null check (decision in ('ACCEPTED', 'DECLINED')),
  evidence jsonb not null default '{}'::jsonb,
  decided_at timestamptz not null default now(),
  unique (principal_id, disclosure_version_id)
);

create table public.policies (
  id uuid primary key default gen_random_uuid(),
  policy_ref text not null unique check (btrim(policy_ref) <> ''),
  policy_kind text not null check (btrim(policy_kind) <> ''),
  status text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.policy_versions (
  id uuid primary key default gen_random_uuid(),
  policy_id uuid not null references public.policies(id) on delete cascade,
  version_ref text not null unique check (btrim(version_ref) <> ''),
  version_number integer not null check (version_number > 0),
  payload jsonb not null default '{}'::jsonb,
  status text not null,
  effective_from timestamptz,
  effective_until timestamptz,
  created_by_principal_id uuid references public.app_principals(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (policy_id, version_number),
  check (effective_until is null or effective_from is null or effective_until > effective_from)
);

create table public.policy_approval_decisions (
  id uuid primary key default gen_random_uuid(),
  decision_ref text not null unique check (btrim(decision_ref) <> ''),
  policy_version_id uuid not null references public.policy_versions(id) on delete restrict,
  decision text not null check (decision in ('APPROVE', 'DENY')),
  actor_principal_id uuid references public.app_principals(id) on delete set null,
  reason text not null check (btrim(reason) <> ''),
  evidence jsonb not null default '{}'::jsonb,
  effective_at timestamptz,
  created_at timestamptz not null default now()
);

create index access_provisioning_status_idx on public.access_provisioning_records (status, created_at);
create index access_recovery_status_idx on public.access_recovery_requests (status, created_at);
create index content_versions_effective_idx on public.content_versions (status, effective_from, effective_until);
create index disclosure_versions_effective_idx on public.disclosure_versions (status, effective_from, effective_until);
create index policy_versions_effective_idx on public.policy_versions (status, effective_from, effective_until);
