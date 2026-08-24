create table public.app_principals (
  id uuid primary key default gen_random_uuid(),
  principal_ref text not null unique check (btrim(principal_ref) <> ''),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  principal_kind text not null check (principal_kind in ('USER', 'SYSTEM')),
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'SUSPENDED', 'REVOKED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (principal_kind = 'USER' and auth_user_id is not null)
    or (principal_kind = 'SYSTEM' and auth_user_id is null)
  )
);

create table public.role_catalog (
  role_id text primary key check (role_id ~ '^ROL-[0-9]{3}$'),
  name text not null unique check (btrim(name) <> ''),
  created_at timestamptz not null default now()
);

create table public.capability_catalog (
  capability_id text primary key check (capability_id ~ '^CAP-[0-9]{3}$'),
  name text not null unique check (btrim(name) <> ''),
  created_at timestamptz not null default now()
);

create table public.resource_catalog (
  resource_id text primary key check (resource_id ~ '^RES-[0-9]{3}$'),
  name text not null unique check (btrim(name) <> ''),
  created_at timestamptz not null default now()
);

create table public.principal_grants (
  id uuid primary key default gen_random_uuid(),
  grant_ref text not null unique check (btrim(grant_ref) <> ''),
  principal_id uuid not null references public.app_principals(id) on delete cascade,
  role_id text not null references public.role_catalog(role_id),
  capability_id text not null references public.capability_catalog(capability_id),
  resource_id text not null references public.resource_catalog(resource_id),
  object_ref text,
  subject_ref text,
  valid_from timestamptz not null default now(),
  valid_until timestamptz,
  approved_by_principal_id uuid references public.app_principals(id) on delete set null,
  approval_evidence jsonb not null default '{}'::jsonb,
  revoked_at timestamptz,
  revoked_by_principal_id uuid references public.app_principals(id) on delete set null,
  revocation_evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (valid_until is null or valid_until > valid_from),
  check ((revoked_at is null and revoked_by_principal_id is null) or revoked_at is not null)
);

create index principal_grants_active_lookup_idx
  on public.principal_grants (principal_id, capability_id, resource_id, valid_from, valid_until, revoked_at);
create index principal_grants_object_scope_idx
  on public.principal_grants (principal_id, resource_id, object_ref)
  where object_ref is not null;
create index principal_grants_subject_scope_idx
  on public.principal_grants (principal_id, resource_id, subject_ref)
  where subject_ref is not null;
