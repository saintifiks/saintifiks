-- Argumen memakai editor Studio yang sama dengan artikel redaksi. Isi tulisan disimpan sebagai dokumen Studio (JSON);
-- kolom content (Markdown) tetap diisi turunan untuk pencarian, waktu baca, dan tulisan lama (studio_document kosong).

alter table public.opinion_articles
  add column if not exists studio_document jsonb;

-- Batas ukuran di lapisan basis data, sejalan dengan batas di API (1 MB).
alter table public.opinion_articles
  add constraint opinion_articles_studio_document_size
  check (studio_document is null or octet_length(studio_document::text) <= 1000000);

notify pgrst, 'reload schema';
