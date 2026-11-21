-- Applied to project mercantile-labelbook (viuruxnnlaovntywpzdk) on 2026-11-21.
-- Optional extra keys for the design-lab function (one per device or AI, individually revocable).
-- Only SHA-256 fingerprints are stored, never the keys themselves. No client policies.
create table public.lab_keys (
  id bigint generated always as identity primary key,
  label text not null,
  key_hash text not null unique,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);
alter table public.lab_keys enable row level security;
revoke all on public.lab_keys from anon, authenticated;
