-- Dua celah yang tersisa dari pengerasan RLS (lihat 20261103101302_tighten_core_rls.sql):
--
-- A. PRIVASI. Tabel interaksi dapat dibaca siapa pun lewat REST API dengan kunci anon (policy SELECT true),
--    sehingga kolom user_id (siapa yang berkomentar / menyukai / membagikan) terbuka walaupun UI menampilkan
--    "Pembaca" anonim. Pembacaan publik kini dilakukan server lewat service_role (kolom tanpa user_id);
--    pengguna terautentikasi hanya bisa membaca baris miliknya sendiri.
--
-- B. MODERASI. Penulis opini bisa mengubah kolom status artikelnya sendiri langsung via REST, termasuk
--    membuka kembali artikel yang disembunyikan moderator. Aturan "hidden tidak bisa diubah penulis" hanya
--    ada di kode aplikasi. Trigger berikut memindahkannya ke database.
--
-- STATUS: sudah diterapkan ke produksi 2026-11-03 (versi 20261103123129), setelah kode ter-deploy.
--
-- URUTAN DEPLOY: kode aplikasi (membaca lewat admin client) harus sudah live SEBELUM migrasi ini dijalankan,
-- jika tidak komentar dan jumlah share akan tampak kosong di situs.
--
-- Rollback: lihat blok di bagian bawah.

-- ---------------------------------------------------------------------------------------------
-- A. Tutup pembacaan publik atas tabel yang memuat user_id
-- ---------------------------------------------------------------------------------------------

drop policy if exists "Komentar publik bisa dibaca semua orang" on public.comments;
create policy "User membaca komentarnya sendiri"
  on public.comments as permissive for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Siapapun bisa membaca komentar opinions" on public.opinion_comments;
create policy "User membaca komentar opinions miliknya sendiri"
  on public.opinion_comments as permissive for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Likes opinions bisa dibaca semua orang" on public.opinion_likes;
create policy "User membaca like opinions miliknya sendiri"
  on public.opinion_likes as permissive for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Siapapun bisa membaca data share opinions" on public.opinion_shares;
create policy "User membaca share opinions miliknya sendiri"
  on public.opinion_shares as permissive for select to authenticated
  using (user_id = (select auth.uid()));

-- shares: penulisan dan pembacaan dilakukan server (service_role); tidak ada akses langsung.
drop policy if exists "Share count publik bisa dibaca semua orang" on public.shares;

-- ---------------------------------------------------------------------------------------------
-- B. Penulis tidak boleh mengubah status moderasi atau mengunci-ulang slug lewat REST
-- ---------------------------------------------------------------------------------------------

create or replace function public.guard_opinion_article_update()
returns trigger
language plpgsql
set search_path = ''
as $fn$
begin
  -- Hanya membatasi pengguna biasa (JWT role 'authenticated'). service_role (aksi admin/moderator di
  -- server) dan koneksi langsung (dashboard SQL, migrasi) tidak dibatasi.
  if coalesce(auth.role(), current_user) <> 'authenticated' then
    return new;
  end if;

  if old.status = 'hidden' and new.status is distinct from 'hidden' then
    raise exception 'Artikel yang disembunyikan moderator tidak dapat diubah statusnya oleh penulis'
      using errcode = '42501';
  end if;

  if new.status = 'hidden' and old.status is distinct from 'hidden' then
    raise exception 'Hanya moderator yang dapat menyembunyikan artikel'
      using errcode = '42501';
  end if;

  if old.slug_locked and (new.slug is distinct from old.slug or not new.slug_locked) then
    raise exception 'Slug artikel yang sudah dipublikasikan tidak dapat diubah'
      using errcode = '42501';
  end if;

  if new.author_id is distinct from old.author_id then
    raise exception 'Penulis artikel tidak dapat diubah'
      using errcode = '42501';
  end if;

  return new;
end;
$fn$;

drop trigger if exists opinion_articles_guard on public.opinion_articles;
create trigger opinion_articles_guard
  before update on public.opinion_articles
  for each row execute function public.guard_opinion_article_update();

-- ROLLBACK (hanya bila ada yang rusak):
--   drop trigger if exists opinion_articles_guard on public.opinion_articles;
--   drop function if exists public.guard_opinion_article_update();
--   create policy "Komentar publik bisa dibaca semua orang" on public.comments for select to public using (true);
--   create policy "Siapapun bisa membaca komentar opinions" on public.opinion_comments for select to public using (true);
--   create policy "Likes opinions bisa dibaca semua orang" on public.opinion_likes for select to public using (true);
--   create policy "Siapapun bisa membaca data share opinions" on public.opinion_shares for select to public using (true);
--   create policy "Share count publik bisa dibaca semua orang" on public.shares for select to public using (true);
--   (dan drop policy "User membaca ..." yang baru)
