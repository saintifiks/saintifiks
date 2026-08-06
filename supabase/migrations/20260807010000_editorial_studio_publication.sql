-- Editorial Studio Saintifiks — article identity, immutable publication snapshot, dan publish atomik.
-- Additive: artikel Markdown lama tetap menjadi source of truth sampai mempunyai pointer publikasi Studio.

begin;

alter table public.editorial_studio_documents
  add column if not exists article_id uuid null references public.articles(id) on delete set null,
  add column if not exists published_snapshot_id uuid null,
  add column if not exists workflow_status text not null default 'draft'
    check (workflow_status in ('draft', 'published'));

create unique index if not exists editorial_studio_documents_article_id_unique
  on public.editorial_studio_documents(article_id)
  where article_id is not null;

create table if not exists public.editorial_studio_published_snapshots (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete restrict,
  document_id text not null references public.editorial_studio_documents(id) on delete restrict,
  revision_id uuid not null references public.editorial_studio_revisions(id) on delete restrict,
  revision_number bigint not null check (revision_number > 0),
  schema_version integer not null check (schema_version > 0),
  title text not null check (char_length(title) between 1 and 300),
  deck text not null check (char_length(deck) <= 1200),
  slug text not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  fingerprint text not null check (fingerprint ~ '^[a-f0-9]{64}$'),
  created_by uuid null references auth.users(id) on delete set null,
  published_at timestamptz not null default now(),
  unique (article_id, revision_id)
);

create table if not exists public.editorial_studio_publications (
  article_id uuid primary key references public.articles(id) on delete cascade,
  snapshot_id uuid not null references public.editorial_studio_published_snapshots(id) on delete restrict,
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'editorial_studio_documents_published_snapshot_fk'
  ) then
    alter table public.editorial_studio_documents
      add constraint editorial_studio_documents_published_snapshot_fk
      foreign key (published_snapshot_id)
      references public.editorial_studio_published_snapshots(id)
      on delete set null
      deferrable initially deferred;
  end if;
end $$;

create index if not exists editorial_studio_snapshots_article_published_idx
  on public.editorial_studio_published_snapshots(article_id, published_at desc);

alter table public.editorial_studio_published_snapshots enable row level security;
alter table public.editorial_studio_publications enable row level security;
alter table public.editorial_studio_published_snapshots force row level security;
alter table public.editorial_studio_publications force row level security;

drop policy if exists "current studio publications are public" on public.editorial_studio_publications;
create policy "current studio publications are public"
  on public.editorial_studio_publications for select to anon, authenticated
  using (true);

drop policy if exists "current studio snapshots are public" on public.editorial_studio_published_snapshots;
create policy "current studio snapshots are public"
  on public.editorial_studio_published_snapshots for select to anon, authenticated
  using (exists (
    select 1 from public.editorial_studio_publications as publications
    where publications.snapshot_id = id
  ));

revoke all on table public.editorial_studio_published_snapshots from public, anon, authenticated;
revoke all on table public.editorial_studio_publications from public, anon, authenticated;
grant select on table public.editorial_studio_published_snapshots to anon, authenticated, service_role;
grant select on table public.editorial_studio_publications to anon, authenticated, service_role;
grant insert on table public.editorial_studio_published_snapshots to service_role;
grant insert, update, delete on table public.editorial_studio_publications to service_role;

create or replace function public.prevent_studio_snapshot_mutation()
returns trigger language plpgsql as $$
begin
  raise exception 'Published Studio snapshots are immutable';
end;
$$;

drop trigger if exists editorial_studio_snapshots_immutable on public.editorial_studio_published_snapshots;
create trigger editorial_studio_snapshots_immutable
  before update or delete on public.editorial_studio_published_snapshots
  for each row execute function public.prevent_studio_snapshot_mutation();

create or replace function public.link_editorial_revision_to_article()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  metadata jsonb;
  requested_article_id uuid;
  linked_article_id uuid;
  draft_slug text;
begin
  metadata := new.content -> 'article';
  if jsonb_typeof(metadata) <> 'object' or metadata ->> 'kind' <> 'article' then
    return new;
  end if;

  begin
    requested_article_id := nullif(metadata ->> 'articleId', '')::uuid;
  exception when invalid_text_representation then
    raise exception 'Invalid article identity in Studio document';
  end;

  select article_id into linked_article_id
  from public.editorial_studio_documents
  where id = new.document_id
  for update;

  -- Membuka editor kosong boleh membuat revisi Studio, tetapi tidak boleh
  -- mengotori daftar artikel dengan baris "Naskah tanpa judul".
  if linked_article_id is null and requested_article_id is null and btrim(new.title) = '' then
    return new;
  end if;

  if linked_article_id is null and requested_article_id is not null then
    perform 1 from public.articles where id = requested_article_id;
    if not found then raise exception 'Requested article does not exist'; end if;
    linked_article_id := requested_article_id;
  end if;

  if linked_article_id is null then
    draft_slug := 'draft-' || substr(encode(digest(new.document_id, 'sha256'), 'hex'), 1, 24);
    insert into public.articles (title, slug, content, excerpt, cover_image_url, is_published)
    values (
      coalesce(nullif(btrim(new.title), ''), 'Naskah tanpa judul'),
      draft_slug,
      '',
      nullif(btrim(new.deck), ''),
      nullif(metadata ->> 'coverImageUrl', ''),
      false
    ) returning id into linked_article_id;
  end if;

  update public.editorial_studio_documents
  set article_id = linked_article_id
  where id = new.document_id
    and (article_id is null or article_id = linked_article_id);

  if not found then raise exception 'Studio document is linked to another article'; end if;

  update public.articles
  set title = coalesce(nullif(btrim(new.title), ''), title),
      excerpt = nullif(btrim(new.deck), ''),
      cover_image_url = nullif(metadata ->> 'coverImageUrl', ''),
      category = nullif(metadata ->> 'category', ''),
      kicker = nullif(metadata ->> 'kicker', ''),
      cover_illustrator = nullif(metadata ->> 'coverIllustrator', ''),
      country = nullif(metadata ->> 'country', '')
  where id = linked_article_id and is_published = false;

  return new;
end;
$$;

drop trigger if exists editorial_studio_revision_article_link on public.editorial_studio_revisions;
create trigger editorial_studio_revision_article_link
  after insert on public.editorial_studio_revisions
  for each row execute function public.link_editorial_revision_to_article();

revoke all on function public.prevent_studio_snapshot_mutation() from public, anon, authenticated;
revoke all on function public.link_editorial_revision_to_article() from public, anon, authenticated;

create or replace function public.publish_editorial_studio_article(
  target_document_id text,
  expected_revision_number bigint,
  legacy_content text,
  actor_id uuid
)
returns table (
  published_article_id uuid,
  published_snapshot_id uuid,
  published_slug text,
  published_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  studio_document public.editorial_studio_documents%rowtype;
  studio_revision public.editorial_studio_revisions%rowtype;
  metadata jsonb;
  target_slug text;
  created_snapshot public.editorial_studio_published_snapshots%rowtype;
  publication_time timestamptz := now();
begin
  select * into studio_document
  from public.editorial_studio_documents
  where id = target_document_id
  for update;

  if not found or studio_document.article_id is null then
    raise exception 'Studio article identity is not available';
  end if;
  if studio_document.current_revision_number <> expected_revision_number then
    raise exception 'Studio revision is stale';
  end if;

  select * into studio_revision
  from public.editorial_studio_revisions
  where id = studio_document.current_revision_id;
  if not found then raise exception 'Studio revision is missing'; end if;

  metadata := studio_revision.content -> 'article';
  target_slug := btrim(coalesce(metadata ->> 'slug', ''));
  if btrim(studio_revision.title) = '' or target_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' then
    raise exception 'Studio publication metadata is invalid';
  end if;

  select * into created_snapshot
  from public.editorial_studio_published_snapshots
  where article_id = studio_document.article_id
    and revision_id = studio_revision.id;

  if not found then
    insert into public.editorial_studio_published_snapshots (
      article_id, document_id, revision_id, revision_number, schema_version,
      title, deck, slug, content, fingerprint, created_by, published_at
    ) values (
      studio_document.article_id, studio_document.id, studio_revision.id,
      studio_revision.revision_number, studio_revision.schema_version,
      studio_revision.title, studio_revision.deck, target_slug,
      studio_revision.content, studio_revision.fingerprint, actor_id, publication_time
    ) returning * into created_snapshot;
  end if;

  insert into public.editorial_studio_publications (article_id, snapshot_id, updated_at)
  values (studio_document.article_id, created_snapshot.id, publication_time)
  on conflict (article_id) do update
    set snapshot_id = excluded.snapshot_id,
        updated_at = excluded.updated_at;

  update public.editorial_studio_documents
  set published_snapshot_id = created_snapshot.id,
      workflow_status = 'published',
      updated_by = actor_id,
      updated_at = publication_time
  where id = studio_document.id;

  update public.articles
  set title = studio_revision.title,
      slug = target_slug,
      content = legacy_content,
      excerpt = nullif(btrim(studio_revision.deck), ''),
      cover_image_url = nullif(metadata ->> 'coverImageUrl', ''),
      category = nullif(metadata ->> 'category', ''),
      kicker = nullif(metadata ->> 'kicker', ''),
      cover_illustrator = nullif(metadata ->> 'coverIllustrator', ''),
      country = nullif(metadata ->> 'country', ''),
      is_published = true,
      published_at = coalesce(published_at, publication_time)
  where id = studio_document.article_id;

  return query select studio_document.article_id, created_snapshot.id, target_slug, publication_time;
end;
$$;

create or replace function public.unpublish_editorial_studio_article(
  target_document_id text,
  actor_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare linked_article_id uuid;
begin
  select article_id into linked_article_id
  from public.editorial_studio_documents
  where id = target_document_id
  for update;
  if linked_article_id is null then raise exception 'Studio article is not linked'; end if;

  update public.articles set is_published = false, published_at = null where id = linked_article_id;
  delete from public.editorial_studio_publications where article_id = linked_article_id;
  update public.editorial_studio_documents
  set workflow_status = 'draft', updated_by = actor_id, updated_at = now()
  where id = target_document_id;
  return linked_article_id;
end;
$$;

revoke all on function public.publish_editorial_studio_article(text, bigint, text, uuid) from public, anon, authenticated;
revoke all on function public.unpublish_editorial_studio_article(text, uuid) from public, anon, authenticated;
grant execute on function public.publish_editorial_studio_article(text, bigint, text, uuid) to service_role;
grant execute on function public.unpublish_editorial_studio_article(text, uuid) to service_role;

commit;
