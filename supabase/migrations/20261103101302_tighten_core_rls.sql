-- APPLIED to production 2026-11-03 (version 20261103101302) via Supabase MCP apply_migration.
--
-- Tujuan: menutup policy RLS yang membolehkan SIAPA PUN yang sudah login menulis ke tabel editorial.
-- Dasar temuan: query pg_policies pada produksi (2026-11-03). Lihat
-- supabase/baseline/00000000000000_core_schema_baseline.sql (baris bertanda "TEMUAN").
--
-- Kompatibilitas aplikasi (diperiksa di kode):
--  * Aksi admin lama (app/(admin)/dashboard/artikel/actions.ts, koreksi/actions.ts) menulis lewat
--    klien sesi pengguna setelah requireAdmin() → TETAP berfungsi karena policy baru
--    mengizinkan pengguna yang punya baris aktif di admin_memberships.
--  * /api/shares menulis lewat service_role → tidak terpengaruh (service_role melewati RLS).
--  * /api/comments menulis dengan user_id = user.id → lolos policy yang diperketat.
--  * Produksi saat ini: admin_memberships berisi 1 baris (role=admin, enabled=true) → pemilik tidak terkunci.
--
-- Status: diterapkan ke produksi atas persetujuan owner.
-- Cara membatalkan: lihat blok ROLLBACK di bagian bawah.

BEGIN;

-- 1. articles: hanya anggota admin aktif yang boleh menulis -----------------------------------
DROP POLICY IF EXISTS "Hanya user terautentikasi yang bisa menulis" ON public.articles;
CREATE POLICY "Admin aktif bisa menulis artikel"
  ON public.articles AS PERMISSIVE FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_memberships m
                 WHERE m.user_id = (SELECT auth.uid()) AND m.enabled
                   AND m.role IN ('admin','publisher')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_memberships m
                      WHERE m.user_id = (SELECT auth.uid()) AND m.enabled
                        AND m.role IN ('admin','publisher')));

-- 2. article_charts ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Akses kelola chart hanya untuk admin terautentikasi" ON public.article_charts;
CREATE POLICY "Admin aktif bisa kelola chart"
  ON public.article_charts AS PERMISSIVE FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_memberships m
                 WHERE m.user_id = (SELECT auth.uid()) AND m.enabled
                   AND m.role IN ('admin','publisher')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_memberships m
                      WHERE m.user_id = (SELECT auth.uid()) AND m.enabled
                        AND m.role IN ('admin','publisher')));

-- 3. article_corrections: hanya admin/moderator yang boleh mengubah status ----------------------
DROP POLICY IF EXISTS "Admin bisa manage koreksi" ON public.article_corrections;
CREATE POLICY "Moderator aktif bisa review koreksi"
  ON public.article_corrections AS PERMISSIVE FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_memberships m
                 WHERE m.user_id = (SELECT auth.uid()) AND m.enabled
                   AND m.role IN ('admin','publisher','moderator')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_memberships m
                      WHERE m.user_id = (SELECT auth.uid()) AND m.enabled
                        AND m.role IN ('admin','publisher','moderator')));

-- 4. opinion_corrections: sama ------------------------------------------------------------------
DROP POLICY IF EXISTS "Admin bisa review koreksi opinions" ON public.opinion_corrections;
CREATE POLICY "Moderator aktif bisa review koreksi opinions"
  ON public.opinion_corrections AS PERMISSIVE FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_memberships m
                 WHERE m.user_id = (SELECT auth.uid()) AND m.enabled
                   AND m.role IN ('admin','publisher','moderator')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_memberships m
                      WHERE m.user_id = (SELECT auth.uid()) AND m.enabled
                        AND m.role IN ('admin','publisher','moderator')));

-- 5. comments: user_id harus milik pemanggil (cegah komentar atas nama orang lain) ---------------
DROP POLICY IF EXISTS "Hanya user terautentikasi yang bisa menulis komentar" ON public.comments;
CREATE POLICY "User bisa menulis komentar atas nama sendiri"
  ON public.comments AS PERMISSIVE FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- 6. shares: penulisan dilakukan server-side (service_role) → tutup jalur langsung -----------------
DROP POLICY IF EXISTS "Hanya user terautentikasi yang bisa mencatat share" ON public.shares;

-- 7. Fungsi event-trigger tidak perlu dapat dipanggil via /rest/v1/rpc ------------------------------
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;

COMMIT;

-- ROLLBACK (kembalikan ke keadaan semula, hanya bila ada yang rusak):
--   DROP POLICY "Admin aktif bisa menulis artikel" ON public.articles;
--   CREATE POLICY "Hanya user terautentikasi yang bisa menulis" ON public.articles FOR ALL TO authenticated USING (true) WITH CHECK (true);
--   (ulangi pola yang sama untuk tabel lain; teks aslinya ada di supabase/baseline)

-- TIDAK termasuk di sini (butuh keputusan/perubahan aplikasi, lihat docs/decisions/0001):
--  * comments & opinion_comments SELECT true → kolom user_id terbaca publik via REST, bertentangan
--    dengan klaim privasi "Pembaca anonim". Perlu view publik tanpa user_id + cabut SELECT langsung.
--  * opinion_articles UPDATE oleh penulis dapat mengubah kolom status langsung (melewati moderasi).
--  * 23 policy memakai auth.uid() tanpa (select ...) dan 35 FK tanpa indeks (kinerja, bukan keamanan).
--  * Cabut grant berlebih (TRUNCATE/TRIGGER/REFERENCES) dari anon/authenticated.
--  * Aktifkan "Leaked password protection" di dashboard Auth (hanya relevan bila kata sandi dipakai).
