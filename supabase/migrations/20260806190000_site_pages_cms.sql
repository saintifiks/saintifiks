-- CMS Halaman Situs Saintifiks
-- Jalankan satu kali melalui Supabase SQL Editor.

begin;

create extension if not exists pgcrypto;

create table if not exists public.site_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  path text not null unique check (path ~ '^/[a-z0-9/-]*$'),
  name text not null,
  template_key text not null check (template_key in ('editorial', 'policy', 'standard')),
  draft_revision_id uuid null,
  published_revision_id uuid null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_page_revisions (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.site_pages(id) on delete cascade,
  version integer not null check (version > 0),
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  meta_title text not null check (char_length(meta_title) between 1 and 70),
  meta_description text not null check (char_length(meta_description) between 1 and 180),
  robots_index boolean not null default false,
  change_summary text null,
  created_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  published_at timestamptz null,
  unique (page_id, version)
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'site_pages_draft_revision_fk'
  ) then
    alter table public.site_pages
      add constraint site_pages_draft_revision_fk
      foreign key (draft_revision_id) references public.site_page_revisions(id) on delete set null
      deferrable initially deferred;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'site_pages_published_revision_fk'
  ) then
    alter table public.site_pages
      add constraint site_pages_published_revision_fk
      foreign key (published_revision_id) references public.site_page_revisions(id) on delete set null
      deferrable initially deferred;
  end if;
end $$;

create index if not exists site_page_revisions_page_version_idx
  on public.site_page_revisions(page_id, version desc);
create index if not exists site_pages_published_revision_idx
  on public.site_pages(published_revision_id)
  where published_revision_id is not null;

alter table public.site_pages enable row level security;
alter table public.site_page_revisions enable row level security;
alter table public.site_pages force row level security;
alter table public.site_page_revisions force row level security;

drop policy if exists "published site pages are public" on public.site_pages;
create policy "published site pages are public"
  on public.site_pages
  for select
  to anon, authenticated
  using (published_revision_id is not null);

drop policy if exists "published site page revisions are public" on public.site_page_revisions;
create policy "published site page revisions are public"
  on public.site_page_revisions
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.site_pages
      where site_pages.published_revision_id = site_page_revisions.id
    )
  );

-- Tidak ada policy INSERT/UPDATE/DELETE untuk anon atau authenticated.
-- Mutasi CMS hanya dilakukan server Saintifiks memakai service_role setelah requireAdmin().

create or replace function public.create_site_page_draft(
  target_page_id uuid,
  revision_content jsonb,
  revision_meta_title text,
  revision_meta_description text,
  revision_robots_index boolean,
  revision_change_summary text,
  actor_id uuid
)
returns table (revision_id uuid, revision_version integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  next_version integer;
  created_revision_id uuid;
begin
  -- Mengunci satu page agar dua save bersamaan tidak memperoleh nomor versi sama.
  perform 1 from public.site_pages where id = target_page_id for update;
  if not found then
    raise exception 'Page not found';
  end if;

  select coalesce(max(version), 0) + 1
  into next_version
  from public.site_page_revisions
  where page_id = target_page_id;

  insert into public.site_page_revisions (
    page_id,
    version,
    content,
    meta_title,
    meta_description,
    robots_index,
    change_summary,
    created_by
  ) values (
    target_page_id,
    next_version,
    revision_content,
    revision_meta_title,
    revision_meta_description,
    revision_robots_index,
    nullif(trim(revision_change_summary), ''),
    actor_id
  ) returning id into created_revision_id;

  update public.site_pages
  set draft_revision_id = created_revision_id,
      updated_at = now()
  where id = target_page_id;

  return query select created_revision_id, next_version;
end;
$$;

revoke all on function public.create_site_page_draft(uuid, jsonb, text, text, boolean, text, uuid) from public;
revoke all on function public.create_site_page_draft(uuid, jsonb, text, text, boolean, text, uuid) from anon;
revoke all on function public.create_site_page_draft(uuid, jsonb, text, text, boolean, text, uuid) from authenticated;
grant execute on function public.create_site_page_draft(uuid, jsonb, text, text, boolean, text, uuid) to service_role;

create or replace function public.publish_site_page(
  target_page_id uuid,
  target_revision_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.site_page_revisions
    where id = target_revision_id
      and page_id = target_page_id
  ) then
    raise exception 'Revision does not belong to this page';
  end if;

  update public.site_page_revisions
  set published_at = coalesce(published_at, now())
  where id = target_revision_id;

  update public.site_pages
  set published_revision_id = target_revision_id,
      draft_revision_id = null,
      updated_at = now()
  where id = target_page_id;

  if not found then
    raise exception 'Page not found';
  end if;
end;
$$;

revoke all on function public.publish_site_page(uuid, uuid) from public;
revoke all on function public.publish_site_page(uuid, uuid) from anon;
revoke all on function public.publish_site_page(uuid, uuid) from authenticated;
grant execute on function public.publish_site_page(uuid, uuid) to service_role;

insert into public.site_pages (slug, path, name, template_key)
values
  ('tentang-kami', '/tentang-kami', 'Tentang Kami', 'editorial'),
  ('kebijakan-privasi', '/kebijakan-privasi', 'Kebijakan Privasi', 'policy'),
  ('panduan-editorial', '/panduan-editorial', 'Panduan Editorial', 'standard'),
  ('kebijakan-iklan', '/kebijakan-iklan', 'Kebijakan Iklan', 'policy'),
  ('kontak', '/kontak', 'Kontak', 'standard'),
  ('keamanan', '/keamanan', 'Keamanan', 'standard'),
  ('bagikan-ide', '/bagikan-ide', 'Bagikan Ide', 'standard')
on conflict (slug) do nothing;

commit;
