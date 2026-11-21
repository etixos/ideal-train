-- Applied to project mercantile-labelbook (viuruxnnlaovntywpzdk) on 2026-11-21.
-- Mercantile Design Lab: shared storage for the lab's theme and decision register.
-- Isolated from Labelbook and Reports data. No client policies: only the design-lab
-- edge function (service role, guarded by the owner's LAB_KEY) reads or writes these tables.

create table public.lab_state (
  id text primary key default 'main',
  theme jsonb not null,
  register jsonb not null,
  catalog jsonb,
  version integer not null default 1,
  updated_at timestamptz not null default now(),
  updated_by text not null default 'lab'
);

create table public.lab_events (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  actor text not null,
  kind text not null,
  summary text not null,
  payload jsonb
);

create index lab_events_at_idx on public.lab_events (at desc);

alter table public.lab_state enable row level security;
alter table public.lab_events enable row level security;
revoke all on public.lab_state from anon, authenticated;
revoke all on public.lab_events from anon, authenticated;
