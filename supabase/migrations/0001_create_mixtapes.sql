-- Mixtape & Static — Supabase schema
-- Run this in the Supabase SQL Editor (or via migration) to set up the table.

create table if not exists public.mixtapes (
  id uuid primary key,
  title text not null,
  note text not null default '',
  created_at timestamptz not null default now(),
  tracks jsonb not null default '[]'::jsonb
);

-- Public read access (anyone with the link can view a mixtape).
alter table public.mixtapes enable row level security;

create policy "Public read access"
  on public.mixtapes for select
  using (true);

create policy "Public insert access"
  on public.mixtapes for insert
  with check (true);

-- Ensure the `anon` role (used by the browser) has table-level privileges.
grant select, insert on public.mixtapes to anon;
grant select, insert on public.mixtapes to authenticated;
grant select, insert on public.mixtapes to service_role;
