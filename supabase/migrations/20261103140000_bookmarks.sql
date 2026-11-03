-- Daftar Bacaan: artikel yang disimpan pembaca untuk dibaca nanti. Pribadi: setiap pengguna hanya dapat
-- melihat, menambah, dan menghapus simpanannya sendiri. Anon tidak punya akses sama sekali.
--
-- Rollback: drop table public.bookmarks;

create table if not exists public.bookmarks (
  user_id uuid not null references auth.users (id) on delete cascade,
  article_id uuid not null references public.articles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, article_id)
);

-- Daftar tampil terbaru dulu; indeks FK untuk penghapusan berantai saat artikel dihapus.
create index if not exists bookmarks_user_created_idx on public.bookmarks (user_id, created_at desc);
create index if not exists bookmarks_article_idx on public.bookmarks (article_id);

alter table public.bookmarks enable row level security;

revoke all on public.bookmarks from anon, authenticated;
grant select, insert, delete on public.bookmarks to authenticated;

create policy "User membaca simpanannya sendiri"
  on public.bookmarks as permissive for select to authenticated
  using (user_id = (select auth.uid()));

create policy "User menyimpan atas nama sendiri"
  on public.bookmarks as permissive for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "User menghapus simpanannya sendiri"
  on public.bookmarks as permissive for delete to authenticated
  using (user_id = (select auth.uid()));
