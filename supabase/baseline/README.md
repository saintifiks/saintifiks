# Baseline skema inti

`00000000000000_core_schema_baseline.sql` adalah snapshot skema produksi (23 tabel inti + fungsi + trigger + indeks + RLS) yang **tidak pernah masuk ke `supabase/migrations`**. Diekspor baca-saja dari katalog Postgres pada 2026-11-03.

## Kenapa tidak di `migrations/`
Remote sudah memiliki skema ini dan hanya mencatat 6 migrasi. File bertimestamp lebih awal di `migrations/` akan ditolak `supabase db push --dry-run` (urutan) dan, bila dipaksa, mencoba membuat ulang tabel yang sudah ada.

## Cara mengesahkannya (butuh Supabase CLI + akses project; lakukan sekali)
1. Salin file menjadi `supabase/migrations/00000000000000_core_schema_baseline.sql`.
2. Tandai sudah-diterapkan di remote tanpa menjalankannya:
   `supabase migration repair --status applied 00000000000000 --linked`
3. Verifikasi: database kosong lokal + seluruh migrasi harus menghasilkan skema yang sama dengan produksi
   (`supabase db reset` lalu `supabase db diff --linked` harus kosong).

## Keterbatasan snapshot ini
- Dibuat lewat query katalog, bukan `pg_dump`; belum diuji pada database kosong. Langkah 3 adalah ujinya.
- Tidak mencakup: grant tingkat tabel, ekstensi, bucket Storage dan policy `storage.objects`, konfigurasi Auth, edge/event trigger selain definisi fungsi `rls_auto_enable` (pembuatan event trigger-nya belum diekspor).
- Komentar `TEMUAN` menandai policy yang menyimpang dari `security/DATABASE_AUTHORIZATION_TARGET.md`.
