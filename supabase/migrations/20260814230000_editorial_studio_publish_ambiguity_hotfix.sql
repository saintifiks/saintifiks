-- Editorial Studio Saintifiks — hilangkan ambiguity published_at pada RPC publish.
-- Additive: definisi migration publikasi lama tetap immutable; tabel, RLS, privileges, dan data tidak diubah.

begin;

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

  update public.articles as target_article
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
      published_at = coalesce(target_article.published_at, publication_time)
  where target_article.id = studio_document.article_id;

  return query select studio_document.article_id, created_snapshot.id, target_slug, publication_time;
end;
$$;

commit;
