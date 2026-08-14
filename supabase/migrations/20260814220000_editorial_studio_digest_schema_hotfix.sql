begin;

-- pgcrypto is installed in Supabase's extensions schema. Keep this
-- SECURITY DEFINER function's search_path narrow and qualify digest explicitly.
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
    draft_slug := 'draft-' || substr(encode(extensions.digest(new.document_id, 'sha256'), 'hex'), 1, 24);
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

commit;
