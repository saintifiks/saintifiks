-- Pengerasan penyimpanan gambar dan privasi koreksi.
--
-- A. Bucket artikel-gambar: kebijakan bernama "Hanya admin yang bisa upload dan hapus gambar" ternyata hanya
--    memeriksa bucket, bukan admin — semua pengguna yang masuk bisa mengunggah, menimpa, dan menghapus gambar
--    artikel redaksi. Kini dibatasi ke anggota admin_memberships yang aktif (sejalan dengan isAdmin di aplikasi).
--    Kebijakan SELECT untuk peran authenticated dibuang karena sudah tercakup kebijakan baca publik.
--
-- B. Kedua bucket gambar: tanpa batas ukuran dan jenis berkas. Dibatasi ke 5 MB dan JPG/PNG/WebP/GIF (SVG sengaja
--    tidak diizinkan karena bisa memuat skrip). Berlaku untuk unggahan baru; berkas lama tidak berubah.
--
-- C. Koreksi yang disetujui terbaca publik lewat API beserta kolom user_id pengirimnya; karena user_id juga ada di
--    profil publik, pengirim bisa dikenali. Kolom user_id kini tidak bisa dibaca peran anon dan authenticated.
--    Pembacaan data milik sendiri (halaman Akun, unduh data) dan moderasi dilakukan server dengan service_role.
--    Kebijakan "disetujui atau milik sendiri" dari migrasi akun_pembaca dikembalikan ke "disetujui" saja, karena
--    kebijakan yang merujuk kolom user_id tidak lagi bisa dievaluasi untuk peran tersebut.

-- A ----------------------------------------------------------------------------------------------------------------
drop policy if exists "Hanya admin yang bisa upload dan hapus gambar 1jj6ujl_0" on storage.objects;
drop policy if exists "Hanya admin yang bisa upload dan hapus gambar 1jj6ujl_1" on storage.objects;
drop policy if exists "Hanya admin yang bisa upload dan hapus gambar 1jj6ujl_2" on storage.objects;
drop policy if exists "Hanya admin yang bisa upload dan hapus gambar 1jj6ujl_3" on storage.objects;

create policy "Admin redaksi mengunggah gambar artikel"
  on storage.objects as permissive for insert to authenticated
  with check (
    bucket_id = 'artikel-gambar'
    and exists (
      select 1 from public.admin_memberships m
      where m.user_id = (select auth.uid()) and m.enabled
        and m.role in ('admin', 'publisher', 'moderator', 'security_admin')
    )
  );

create policy "Admin redaksi mengubah gambar artikel"
  on storage.objects as permissive for update to authenticated
  using (
    bucket_id = 'artikel-gambar'
    and exists (
      select 1 from public.admin_memberships m
      where m.user_id = (select auth.uid()) and m.enabled
        and m.role in ('admin', 'publisher', 'moderator', 'security_admin')
    )
  )
  with check (bucket_id = 'artikel-gambar');

create policy "Admin redaksi menghapus gambar artikel"
  on storage.objects as permissive for delete to authenticated
  using (
    bucket_id = 'artikel-gambar'
    and exists (
      select 1 from public.admin_memberships m
      where m.user_id = (select auth.uid()) and m.enabled
        and m.role in ('admin', 'publisher', 'moderator', 'security_admin')
    )
  );

-- B ----------------------------------------------------------------------------------------------------------------
update storage.buckets
set file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
where id in ('artikel-gambar', 'opinions-gambar');

-- C ----------------------------------------------------------------------------------------------------------------
drop policy if exists "Koreksi disetujui atau milik sendiri bisa dibaca" on public.article_corrections;
create policy "Koreksi disetujui bisa dibaca publik"
  on public.article_corrections as permissive for select to public
  using (status = 'approved');

drop policy if exists "Koreksi disetujui atau milik sendiri bisa dibaca" on public.opinion_corrections;
create policy "Koreksi disetujui bisa dibaca publik"
  on public.opinion_corrections as permissive for select to public
  using (status = 'approved');

revoke select on public.article_corrections from anon, authenticated;
grant select (id, article_id, original_text, corrected_text, explanation, status, created_at, approved_at)
  on public.article_corrections to anon, authenticated;

revoke select on public.opinion_corrections from anon, authenticated;
grant select (id, opinion_article_id, original_text, corrected_text, explanation, status, created_at, approved_at)
  on public.opinion_corrections to anon, authenticated;

notify pgrst, 'reload schema';
