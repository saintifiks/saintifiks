-- Editorial Studio Saintifiks — server draft sync, tanpa publication.
-- Jalankan satu kali melalui Supabase SQL Editor setelah branch direview.

begin;

create extension if not exists pgcrypto;

create table if not exists public.editorial_studio_documents (
  id text primary key
    check (id ~ '^doc-[A-Za-z0-9][A-Za-z0-9_-]{2,123}$'),
  title text not null default ''
    check (char_length(title) <= 300),
  deck text not null default ''
    check (char_length(deck) <= 1200),
  current_revision_id uuid null,
  current_revision_number bigint not null default 0
    check (current_revision_number >= 0),
  created_by uuid null references auth.users(id) on delete set null,
  updated_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.editorial_studio_revisions (
  id uuid primary key default gen_random_uuid(),
  document_id text not null references public.editorial_studio_documents(id) on delete cascade,
  revision_number bigint not null check (revision_number > 0),
  base_revision_number bigint null check (base_revision_number is null or base_revision_number >= 0),
  mutation_id uuid not null unique,
  reason text not null check (reason in ('autosave', 'manual', 'restore', 'copy')),
  schema_version integer not null check (schema_version > 0),
  title text not null check (char_length(title) <= 300),
  deck text not null check (char_length(deck) <= 1200),
  content jsonb not null
    check (jsonb_typeof(content) = 'object')
    check (octet_length(content::text) <= 5242880)
    check (content ? 'documentId' and content ->> 'documentId' = document_id)
    check (
      content ? 'schemaVersion'
      and jsonb_typeof(content -> 'schemaVersion') = 'number'
      and (content ->> 'schemaVersion')::integer = schema_version
    ),
  fingerprint text not null check (fingerprint ~ '^[a-f0-9]{64}$'),
  created_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (document_id, revision_number)
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'editorial_studio_documents_current_revision_fk'
  ) then
    alter table public.editorial_studio_documents
      add constraint editorial_studio_documents_current_revision_fk
      foreign key (current_revision_id)
      references public.editorial_studio_revisions(id)
      on delete set null
      deferrable initially deferred;
  end if;
end $$;

create index if not exists editorial_studio_revisions_document_revision_idx
  on public.editorial_studio_revisions(document_id, revision_number desc);
create index if not exists editorial_studio_documents_updated_at_idx
  on public.editorial_studio_documents(updated_at desc);

alter table public.editorial_studio_documents enable row level security;
alter table public.editorial_studio_revisions enable row level security;
alter table public.editorial_studio_documents force row level security;
alter table public.editorial_studio_revisions force row level security;

drop policy if exists "editorial studio documents deny direct clients" on public.editorial_studio_documents;
create policy "editorial studio documents deny direct clients"
  on public.editorial_studio_documents
  for all
  to anon, authenticated
  using (false)
  with check (false);

drop policy if exists "editorial studio revisions deny direct clients" on public.editorial_studio_revisions;
create policy "editorial studio revisions deny direct clients"
  on public.editorial_studio_revisions
  for all
  to anon, authenticated
  using (false)
  with check (false);

revoke all on table public.editorial_studio_documents from public, anon, authenticated;
revoke all on table public.editorial_studio_revisions from public, anon, authenticated;
grant select, insert, update, delete on table public.editorial_studio_documents to service_role;
grant select, insert, update, delete on table public.editorial_studio_revisions to service_role;

create or replace function public.sync_editorial_studio_draft(
  target_document_id text,
  revision_title text,
  revision_deck text,
  revision_content jsonb,
  revision_schema_version integer,
  revision_fingerprint text,
  expected_revision_number bigint,
  client_mutation_id uuid,
  revision_reason text,
  actor_id uuid
)
returns table (
  sync_status text,
  synced_document_id text,
  synced_revision_id uuid,
  synced_revision_number bigint,
  synced_title text,
  synced_deck text,
  synced_content jsonb,
  synced_schema_version integer,
  synced_fingerprint text,
  synced_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  locked_document public.editorial_studio_documents%rowtype;
  existing_mutation public.editorial_studio_revisions%rowtype;
  current_revision public.editorial_studio_revisions%rowtype;
  created_revision public.editorial_studio_revisions%rowtype;
  next_revision_number bigint;
begin
  if target_document_id !~ '^doc-[A-Za-z0-9][A-Za-z0-9_-]{2,123}$' then
    raise exception 'Invalid Studio document id';
  end if;
  if char_length(revision_title) > 300 or char_length(revision_deck) > 1200 then
    raise exception 'Studio metadata exceeds limits';
  end if;
  if jsonb_typeof(revision_content) <> 'object'
     or octet_length(revision_content::text) > 5242880
     or not (revision_content ? 'documentId')
     or revision_content ->> 'documentId' is distinct from target_document_id
     or not (revision_content ? 'schemaVersion')
     or jsonb_typeof(revision_content -> 'schemaVersion') <> 'number'
     or (revision_content ->> 'schemaVersion')::integer <> revision_schema_version then
    raise exception 'Invalid Studio document content';
  end if;
  if revision_fingerprint !~ '^[a-f0-9]{64}$' then
    raise exception 'Invalid Studio fingerprint';
  end if;
  if revision_reason not in ('autosave', 'manual', 'restore', 'copy') then
    raise exception 'Invalid Studio revision reason';
  end if;

  -- Menserialisasi dokumen baru maupun lama, termasuk dua request pertama yang datang bersamaan.
  perform pg_advisory_xact_lock(hashtextextended(target_document_id, 0));

  select revisions.*
  into existing_mutation
  from public.editorial_studio_revisions as revisions
  where revisions.mutation_id = client_mutation_id;

  if found then
    if existing_mutation.document_id <> target_document_id then
      raise exception 'Mutation id already belongs to another document';
    end if;
    return query select
      'duplicate'::text,
      existing_mutation.document_id,
      existing_mutation.id,
      existing_mutation.revision_number,
      existing_mutation.title,
      existing_mutation.deck,
      existing_mutation.content,
      existing_mutation.schema_version,
      existing_mutation.fingerprint,
      existing_mutation.created_at;
    return;
  end if;

  select documents.*
  into locked_document
  from public.editorial_studio_documents as documents
  where documents.id = target_document_id
  for update;

  if not found then
    if expected_revision_number is not null and expected_revision_number <> 0 then
      return query select
        'missing'::text,
        target_document_id,
        null::uuid,
        0::bigint,
        ''::text,
        ''::text,
        null::jsonb,
        revision_schema_version,
        ''::text,
        now();
      return;
    end if;

    insert into public.editorial_studio_documents (
      id,
      title,
      deck,
      created_by,
      updated_by
    ) values (
      target_document_id,
      revision_title,
      revision_deck,
      actor_id,
      actor_id
    ) returning * into locked_document;
  elsif locked_document.current_revision_number <> coalesce(expected_revision_number, -1) then
    select revisions.*
    into current_revision
    from public.editorial_studio_revisions as revisions
    where revisions.id = locked_document.current_revision_id;

    return query select
      'conflict'::text,
      locked_document.id,
      current_revision.id,
      current_revision.revision_number,
      current_revision.title,
      current_revision.deck,
      current_revision.content,
      current_revision.schema_version,
      current_revision.fingerprint,
      current_revision.created_at;
    return;
  end if;

  next_revision_number := locked_document.current_revision_number + 1;

  insert into public.editorial_studio_revisions (
    document_id,
    revision_number,
    base_revision_number,
    mutation_id,
    reason,
    schema_version,
    title,
    deck,
    content,
    fingerprint,
    created_by
  ) values (
    target_document_id,
    next_revision_number,
    expected_revision_number,
    client_mutation_id,
    revision_reason,
    revision_schema_version,
    revision_title,
    revision_deck,
    revision_content,
    revision_fingerprint,
    actor_id
  ) returning * into created_revision;

  update public.editorial_studio_documents
  set title = revision_title,
      deck = revision_deck,
      current_revision_id = created_revision.id,
      current_revision_number = created_revision.revision_number,
      updated_by = actor_id,
      updated_at = created_revision.created_at
  where id = target_document_id;

  return query select
    'accepted'::text,
    created_revision.document_id,
    created_revision.id,
    created_revision.revision_number,
    created_revision.title,
    created_revision.deck,
    created_revision.content,
    created_revision.schema_version,
    created_revision.fingerprint,
    created_revision.created_at;
end;
$$;

revoke all on function public.sync_editorial_studio_draft(
  text, text, text, jsonb, integer, text, bigint, uuid, text, uuid
) from public, anon, authenticated;
grant execute on function public.sync_editorial_studio_draft(
  text, text, text, jsonb, integer, text, bigint, uuid, text, uuid
) to service_role;

commit;
