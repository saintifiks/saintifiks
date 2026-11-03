-- Admin tidak bisa membaca Argumen dan antrean koreksi Argumen: kueri menyisipkan user_profiles lewat
-- opinion_articles, tetapi tidak ada kunci asing dari opinion_articles ke user_profiles (author_id hanya menunjuk
-- auth.users), sehingga PostgREST menolak kueri (PGRST200) dan hasilnya kosong.
-- Kunci asing ini menyambungkan keduanya. user_profiles.user_id unik; setiap penulis sudah punya profil
-- (tulisan tanpa profil tidak bisa dibuat), jadi tidak ada baris yatim.

alter table public.opinion_articles
  add constraint opinion_articles_author_profile_fkey
  foreign key (author_id) references public.user_profiles (user_id) on delete cascade;

-- Kunci asing butuh indeks agar daftar tulisan per penulis dan penghapusan berantai tetap cepat.
create index if not exists opinion_articles_author_id_idx on public.opinion_articles (author_id);

notify pgrst, 'reload schema';
