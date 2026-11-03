-- Halaman Akun pembaca.
--
-- 1. Pembaca bisa melihat status usulan koreksinya sendiri (menunggu, disetujui, ditolak). Sebelumnya hanya koreksi
--    yang disetujui yang terbaca. Kebijakan lama digabung dengan yang baru agar tidak ada dua kebijakan SELECT
--    untuk peran yang sama.
-- 2. Penghapusan akun: usulan koreksi artikel milik pengguna yang dihapus tidak boleh menggagalkan penghapusan
--    (kunci asing semula NO ACTION). Koreksi yang sudah tayang di artikel tetap ada; pengirimnya menjadi kosong.

drop policy if exists "Koreksi approved bisa dibaca publik" on public.article_corrections;
create policy "Koreksi disetujui atau milik sendiri bisa dibaca"
  on public.article_corrections as permissive for select to public
  using (status = 'approved' or user_id = (select auth.uid()));

drop policy if exists "Koreksi disetujui bisa dibaca publik" on public.opinion_corrections;
create policy "Koreksi disetujui atau milik sendiri bisa dibaca"
  on public.opinion_corrections as permissive for select to public
  using (status = 'approved' or user_id = (select auth.uid()));

alter table public.article_corrections alter column user_id drop not null;
alter table public.article_corrections drop constraint article_corrections_user_id_fkey;
alter table public.article_corrections
  add constraint article_corrections_user_id_fkey
  foreign key (user_id) references auth.users (id) on delete set null;

notify pgrst, 'reload schema';
