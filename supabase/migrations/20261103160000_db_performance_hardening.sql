-- Penguatan performa & keamanan basis data (Fase 6A). Tidak mengubah data maupun siapa yang boleh mengakses apa.
--
-- 1. Indeks untuk 35 kunci asing yang belum punya indeks pendukung (pencarian per artikel/pengguna dan
--    penghapusan berantai tidak lagi memindai seluruh tabel).
-- 2. Kebijakan RLS: auth.uid() dibungkus (select auth.uid()) agar dihitung sekali per kueri, bukan per baris.
--    Hanya ekspresi yang berubah; peran dan aksi kebijakan tetap sama.
-- 3. Satu kebijakan baca kembar pada opinion_articles dihapus (definisinya identik dengan yang lain).
-- 4. Tiga fungsi pemicu diberi search_path tetap (mencegah pembajakan lewat skema lain).
--
-- Rollback: indeks -> drop index; kebijakan -> alter policy dengan ekspresi lama; kebijakan kembar -> create policy
-- "public can view published opinion articles" on public.opinion_articles for select to public using (status = 'published');

-- 1. Indeks kunci asing
create index if not exists admin_memberships_created_by_idx on public.admin_memberships (created_by);
create index if not exists analytics_events_user_id_idx on public.analytics_events (user_id);
create index if not exists article_charts_article_id_idx on public.article_charts (article_id);
create index if not exists article_corrections_article_id_idx on public.article_corrections (article_id);
create index if not exists article_corrections_user_id_idx on public.article_corrections (user_id);
create index if not exists article_reports_reporter_user_id_idx on public.article_reports (reporter_user_id);
create index if not exists book_categories_category_id_idx on public.book_categories (category_id);
create index if not exists book_variants_book_id_idx on public.book_variants (book_id);
create index if not exists books_author_id_idx on public.books (author_id);
create index if not exists books_publisher_id_idx on public.books (publisher_id);
create index if not exists categories_parent_id_idx on public.categories (parent_id);
create index if not exists comments_article_id_idx on public.comments (article_id);
create index if not exists comments_user_id_idx on public.comments (user_id);
create index if not exists editorial_studio_documents_created_by_idx on public.editorial_studio_documents (created_by);
create index if not exists editorial_studio_documents_current_revision_id_idx on public.editorial_studio_documents (current_revision_id);
create index if not exists editorial_studio_documents_published_snapshot_id_idx on public.editorial_studio_documents (published_snapshot_id);
create index if not exists editorial_studio_documents_updated_by_idx on public.editorial_studio_documents (updated_by);
create index if not exists editorial_studio_publications_snapshot_id_idx on public.editorial_studio_publications (snapshot_id);
create index if not exists editorial_studio_published_snapshots_created_by_idx on public.editorial_studio_published_snapshots (created_by);
create index if not exists editorial_studio_published_snapshots_document_id_idx on public.editorial_studio_published_snapshots (document_id);
create index if not exists editorial_studio_published_snapshots_revision_id_idx on public.editorial_studio_published_snapshots (revision_id);
create index if not exists editorial_studio_revisions_created_by_idx on public.editorial_studio_revisions (created_by);
create index if not exists inventory_ledger_variant_id_idx on public.inventory_ledger (variant_id);
create index if not exists likes_article_id_idx on public.likes (article_id);
create index if not exists opinion_analytics_events_user_id_idx on public.opinion_analytics_events (user_id);
create index if not exists opinion_comments_opinion_article_id_idx on public.opinion_comments (opinion_article_id);
create index if not exists opinion_comments_user_id_idx on public.opinion_comments (user_id);
create index if not exists opinion_corrections_opinion_article_id_idx on public.opinion_corrections (opinion_article_id);
create index if not exists opinion_corrections_user_id_idx on public.opinion_corrections (user_id);
create index if not exists opinion_shares_opinion_article_id_idx on public.opinion_shares (opinion_article_id);
create index if not exists opinion_shares_user_id_idx on public.opinion_shares (user_id);
create index if not exists shares_article_id_idx on public.shares (article_id);
create index if not exists shares_user_id_idx on public.shares (user_id);
create index if not exists site_page_revisions_created_by_idx on public.site_page_revisions (created_by);
create index if not exists site_pages_draft_revision_id_idx on public.site_pages (draft_revision_id);

-- 2. Kebijakan RLS: auth.uid() dihitung sekali per kueri
alter policy "Users can read own admin membership" on public.admin_memberships
  using ((select auth.uid()) = user_id);

alter policy "User authenticated bisa insert koreksi" on public.article_corrections
  with check ((select auth.uid()) = user_id);

alter policy "User bisa melihat laporan yang dia buat" on public.article_reports
  using (reporter_user_id = (select auth.uid()));
alter policy "User terautentikasi bisa melaporkan artikel" on public.article_reports
  with check (reporter_user_id = (select auth.uid()));

alter policy "User bisa membatalkan like" on public.likes
  using ((select auth.uid()) = user_id);
alter policy "User bisa menambahkan like" on public.likes
  with check ((select auth.uid()) = user_id);
alter policy "User hanya bisa melihat like miliknya sendiri" on public.likes
  using ((select auth.uid()) = user_id);

alter policy "Penulis bisa membaca analytics artikel miliknya" on public.opinion_analytics_events
  using (exists (
    select 1 from public.opinion_articles
    where opinion_articles.id = opinion_analytics_events.opinion_article_id
      and opinion_articles.author_id = (select auth.uid())
  ));

alter policy "Penulis bisa membaca chart artikelnya" on public.opinion_article_charts
  using (exists (
    select 1 from public.opinion_articles
    where opinion_articles.id = opinion_article_charts.opinion_article_id
      and opinion_articles.author_id = (select auth.uid())
  ));
alter policy "Penulis bisa membuat chart untuk artikelnya" on public.opinion_article_charts
  with check (exists (
    select 1 from public.opinion_articles
    where opinion_articles.id = opinion_article_charts.opinion_article_id
      and opinion_articles.author_id = (select auth.uid())
  ));
alter policy "Penulis bisa menghapus chart artikelnya" on public.opinion_article_charts
  using (exists (
    select 1 from public.opinion_articles
    where opinion_articles.id = opinion_article_charts.opinion_article_id
      and opinion_articles.author_id = (select auth.uid())
  ));
alter policy "Penulis bisa mengubah chart artikelnya" on public.opinion_article_charts
  using (exists (
    select 1 from public.opinion_articles
    where opinion_articles.id = opinion_article_charts.opinion_article_id
      and opinion_articles.author_id = (select auth.uid())
  ));

alter policy "Penulis bisa membaca semua artikel miliknya" on public.opinion_articles
  using (author_id = (select auth.uid()));
alter policy "Penulis bisa membuat artikel" on public.opinion_articles
  with check (author_id = (select auth.uid()));
alter policy "Penulis bisa menghapus draft miliknya" on public.opinion_articles
  using (author_id = (select auth.uid()) and status = 'draft');
alter policy "Penulis bisa mengubah artikel miliknya" on public.opinion_articles
  using (author_id = (select auth.uid()))
  with check (author_id = (select auth.uid()));

alter policy "User terautentikasi bisa mengirim komentar" on public.opinion_comments
  with check ((select auth.uid()) = user_id);
alter policy "User terautentikasi bisa submit koreksi" on public.opinion_corrections
  with check ((select auth.uid()) = user_id);

alter policy "User bisa menambah like" on public.opinion_likes
  with check (user_id = (select auth.uid()));
alter policy "User bisa unlike" on public.opinion_likes
  using (user_id = (select auth.uid()));

alter policy "User terautentikasi bisa mencatat share" on public.opinion_shares
  with check ((select auth.uid()) = user_id);

alter policy "User hanya bisa membuat profil sendiri" on public.user_profiles
  with check (user_id = (select auth.uid()));
alter policy "User hanya bisa mengubah profil sendiri" on public.user_profiles
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- 3. Kebijakan baca kembar (identik: status = 'published' untuk semua peran)
drop policy if exists "public can view published opinion articles" on public.opinion_articles;

-- 4. search_path tetap untuk fungsi pemicu
alter function public.update_updated_at_column() set search_path = public, pg_temp;
alter function public.update_variant_stock_qty() set search_path = public, pg_temp;
alter function public.prevent_studio_snapshot_mutation() set search_path = public, pg_temp;
