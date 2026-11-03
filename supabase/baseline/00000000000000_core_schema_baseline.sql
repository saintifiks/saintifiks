-- Core schema baseline — REFERENSI, bukan migrasi yang dijalankan.
--
-- Snapshot skema inti produksi (project efkolgdeddpnpzgcnclo) per 2026-11-03, diekspor
-- baca-saja dari katalog Postgres. Mencakup 23 tabel inti yang TIDAK ada di
-- supabase/migrations (6 migrasi yang ada hanya mencakup site_pages, editorial_studio_*,
-- admin_memberships).
--
-- Sengaja ditaruh di supabase/baseline/, bukan supabase/migrations/: remote sudah punya
-- skema ini dan riwayat migrasinya; menaruh file bertimestamp lebih awal di migrations/
-- akan membuat `supabase db push --dry-run` di CI menolak urutan. Lihat
-- supabase/baseline/README.md untuk cara mengesahkannya sebagai migrasi.
--
-- Skema ini mencerminkan keadaan produksi APA ADANYA, termasuk policy RLS yang terlalu
-- longgar (ditandai "TEMUAN" di bawah). Perbaikannya sudah diterapkan:
-- supabase/migrations/20261103101302_tighten_core_rls.sql. Baris "TEMUAN" di bawah adalah keadaan SEBELUM perbaikan.

SET search_path = public;

-- ============================================================================
-- 1. TABEL
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.articles (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  title text NOT NULL,
  slug text NOT NULL,
  content text NOT NULL,
  excerpt text,
  cover_image_url text,
  is_published boolean DEFAULT false NOT NULL,
  published_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  category text,
  kicker text,
  country text,
  cover_illustrator text
);

CREATE TABLE IF NOT EXISTS public.article_charts (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  article_id uuid NOT NULL,
  chart_identifier text NOT NULL,
  config jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.article_corrections (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  article_id uuid NOT NULL,
  user_id uuid NOT NULL,
  original_text text NOT NULL,
  corrected_text text NOT NULL,
  explanation text,
  status text DEFAULT 'pending'::text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  approved_at timestamp with time zone
);

CREATE TABLE IF NOT EXISTS public.article_reports (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  opinion_article_id uuid NOT NULL,
  reporter_user_id uuid,
  reason text NOT NULL,
  status text DEFAULT 'pending'::text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.likes (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  article_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.comments (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  article_id uuid NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.shares (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  article_id uuid NOT NULL,
  user_id uuid,
  platform text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  event_type text NOT NULL,
  path text NOT NULL,
  session_id text NOT NULL,
  user_id uuid,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_profiles (
  user_id uuid NOT NULL,
  username text NOT NULL,
  display_name text NOT NULL,
  bio text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.opinion_articles (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  author_id uuid NOT NULL,
  title text NOT NULL,
  slug text NOT NULL,
  content text DEFAULT ''::text NOT NULL,
  excerpt text,
  cover_image_url text,
  status text DEFAULT 'draft'::text NOT NULL,
  slug_locked boolean DEFAULT false NOT NULL,
  published_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  category text,
  country text,
  cover_credit text
);

CREATE TABLE IF NOT EXISTS public.opinion_article_charts (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  opinion_article_id uuid NOT NULL,
  chart_id text NOT NULL,
  config jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.opinion_likes (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  opinion_article_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.opinion_comments (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  opinion_article_id uuid NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.opinion_corrections (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  opinion_article_id uuid NOT NULL,
  user_id uuid NOT NULL,
  original_text text NOT NULL,
  corrected_text text NOT NULL,
  explanation text,
  status text DEFAULT 'pending'::text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  approved_at timestamp with time zone
);

CREATE TABLE IF NOT EXISTS public.opinion_shares (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  opinion_article_id uuid NOT NULL,
  user_id uuid,
  platform text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.opinion_analytics_events (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  opinion_article_id uuid NOT NULL,
  event_type text NOT NULL,
  user_id uuid,
  session_id text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.authors (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL,
  biography text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.publishers (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  parent_id uuid,
  slug character varying(128) NOT NULL,
  name text NOT NULL,
  sort_order integer DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.books (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  isbn13 character varying(13),
  title text NOT NULL,
  subtitle text,
  author_id uuid,
  publisher_id uuid,
  description text,
  editorial_take text,
  language character varying(8),
  status text DEFAULT 'draft'::text NOT NULL,
  visible_at timestamp with time zone,
  hidden_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  slug text,
  cover_image_url text
);

CREATE TABLE IF NOT EXISTS public.book_categories (
  book_id uuid NOT NULL,
  category_id uuid NOT NULL
);

CREATE TABLE IF NOT EXISTS public.book_variants (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  book_id uuid NOT NULL,
  sku character varying(64) NOT NULL,
  format text NOT NULL,
  price_amount numeric(12,2) NOT NULL,
  list_price numeric(12,2),
  currency character(3) DEFAULT 'IDR'::bpchar,
  weight_grams integer,
  stock_qty integer DEFAULT 0 NOT NULL,
  low_stock_threshold integer DEFAULT 5,
  is_active boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.inventory_ledger (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  variant_id uuid NOT NULL,
  delta integer NOT NULL,
  reason text NOT NULL,
  reference_order_id uuid,
  actor_id uuid,
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- 2. PRIMARY KEY, UNIQUE, CHECK
-- ============================================================================

ALTER TABLE public.articles ADD CONSTRAINT articles_pkey PRIMARY KEY (id);
ALTER TABLE public.articles ADD CONSTRAINT articles_slug_key UNIQUE (slug);
ALTER TABLE public.article_charts ADD CONSTRAINT article_charts_pkey PRIMARY KEY (id);
ALTER TABLE public.article_corrections ADD CONSTRAINT article_corrections_pkey PRIMARY KEY (id);
ALTER TABLE public.article_corrections ADD CONSTRAINT article_corrections_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])));
ALTER TABLE public.article_reports ADD CONSTRAINT article_reports_pkey PRIMARY KEY (id);
ALTER TABLE public.article_reports ADD CONSTRAINT article_reports_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'reviewed'::text])));
ALTER TABLE public.article_reports ADD CONSTRAINT article_reports_unique UNIQUE (opinion_article_id, reporter_user_id);
ALTER TABLE public.article_reports ADD CONSTRAINT reason_not_empty CHECK ((char_length(TRIM(BOTH FROM reason)) > 0));
ALTER TABLE public.likes ADD CONSTRAINT likes_pkey PRIMARY KEY (id);
ALTER TABLE public.likes ADD CONSTRAINT likes_user_id_article_id_key UNIQUE (user_id, article_id);
ALTER TABLE public.comments ADD CONSTRAINT comments_pkey PRIMARY KEY (id);
ALTER TABLE public.shares ADD CONSTRAINT shares_pkey PRIMARY KEY (id);
ALTER TABLE public.shares ADD CONSTRAINT shares_platform_check CHECK ((platform = ANY (ARRAY['instagram'::text, 'twitter'::text, 'facebook'::text, 'whatsapp'::text, 'copy'::text])));
ALTER TABLE public.analytics_events ADD CONSTRAINT analytics_events_pkey PRIMARY KEY (id);
ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (user_id);
ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_username_key UNIQUE (username);
ALTER TABLE public.user_profiles ADD CONSTRAINT display_name_not_empty CHECK ((char_length(TRIM(BOTH FROM display_name)) > 0));
ALTER TABLE public.user_profiles ADD CONSTRAINT username_format CHECK ((username ~ '^[a-z0-9][a-z0-9\-]{1,28}[a-z0-9]$'::text));
ALTER TABLE public.opinion_articles ADD CONSTRAINT opinion_articles_pkey PRIMARY KEY (id);
ALTER TABLE public.opinion_articles ADD CONSTRAINT opinion_articles_author_slug_unique UNIQUE (author_id, slug);
ALTER TABLE public.opinion_articles ADD CONSTRAINT opinion_articles_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text, 'hidden'::text])));
ALTER TABLE public.opinion_articles ADD CONSTRAINT published_has_timestamp CHECK (((status <> 'published'::text) OR (published_at IS NOT NULL)));
ALTER TABLE public.opinion_articles ADD CONSTRAINT slug_format CHECK ((slug ~ '^[a-z0-9][a-z0-9\-]*[a-z0-9]$'::text));
ALTER TABLE public.opinion_article_charts ADD CONSTRAINT opinion_article_charts_pkey PRIMARY KEY (id);
ALTER TABLE public.opinion_article_charts ADD CONSTRAINT opinion_article_charts_unique UNIQUE (opinion_article_id, chart_id);
ALTER TABLE public.opinion_likes ADD CONSTRAINT opinion_likes_pkey PRIMARY KEY (id);
ALTER TABLE public.opinion_likes ADD CONSTRAINT opinion_likes_unique UNIQUE (user_id, opinion_article_id);
ALTER TABLE public.opinion_comments ADD CONSTRAINT opinion_comments_pkey PRIMARY KEY (id);
ALTER TABLE public.opinion_corrections ADD CONSTRAINT opinion_corrections_pkey PRIMARY KEY (id);
ALTER TABLE public.opinion_corrections ADD CONSTRAINT opinion_corrections_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])));
ALTER TABLE public.opinion_shares ADD CONSTRAINT opinion_shares_pkey PRIMARY KEY (id);
ALTER TABLE public.opinion_shares ADD CONSTRAINT opinion_shares_platform_check CHECK ((platform = ANY (ARRAY['instagram'::text, 'twitter'::text, 'facebook'::text, 'whatsapp'::text, 'copy'::text])));
ALTER TABLE public.opinion_analytics_events ADD CONSTRAINT opinion_analytics_events_pkey PRIMARY KEY (id);
ALTER TABLE public.opinion_analytics_events ADD CONSTRAINT opinion_analytics_events_event_type_check CHECK ((event_type = ANY (ARRAY['page_view'::text, 'scroll_25'::text, 'scroll_50'::text, 'scroll_75'::text, 'scroll_100'::text])));
ALTER TABLE public.authors ADD CONSTRAINT authors_pkey PRIMARY KEY (id);
ALTER TABLE public.publishers ADD CONSTRAINT publishers_pkey PRIMARY KEY (id);
ALTER TABLE public.categories ADD CONSTRAINT categories_pkey PRIMARY KEY (id);
ALTER TABLE public.categories ADD CONSTRAINT categories_slug_key UNIQUE (slug);
ALTER TABLE public.books ADD CONSTRAINT books_pkey PRIMARY KEY (id);
ALTER TABLE public.books ADD CONSTRAINT books_isbn13_key UNIQUE (isbn13);
ALTER TABLE public.books ADD CONSTRAINT books_slug_key UNIQUE (slug);
ALTER TABLE public.books ADD CONSTRAINT books_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'active'::text, 'archived'::text, 'discontinued'::text])));
ALTER TABLE public.book_categories ADD CONSTRAINT book_categories_pkey PRIMARY KEY (book_id, category_id);
ALTER TABLE public.book_variants ADD CONSTRAINT book_variants_pkey PRIMARY KEY (id);
ALTER TABLE public.book_variants ADD CONSTRAINT book_variants_sku_key UNIQUE (sku);
ALTER TABLE public.book_variants ADD CONSTRAINT book_variants_format_check CHECK ((format = ANY (ARRAY['hardcover'::text, 'paperback'::text, 'ebook'::text, 'audiobook'::text])));
ALTER TABLE public.inventory_ledger ADD CONSTRAINT inventory_ledger_pkey PRIMARY KEY (id);
ALTER TABLE public.inventory_ledger ADD CONSTRAINT inventory_ledger_reason_check CHECK ((reason = ANY (ARRAY['restock'::text, 'sale'::text, 'return'::text, 'adjustment'::text, 'damage'::text])));

-- ============================================================================
-- 3. FOREIGN KEY
-- ============================================================================

ALTER TABLE public.article_charts ADD CONSTRAINT article_charts_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.articles(id) ON DELETE CASCADE;
ALTER TABLE public.article_corrections ADD CONSTRAINT article_corrections_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.articles(id) ON DELETE CASCADE;
ALTER TABLE public.article_corrections ADD CONSTRAINT article_corrections_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);
ALTER TABLE public.article_reports ADD CONSTRAINT article_reports_opinion_article_id_fkey FOREIGN KEY (opinion_article_id) REFERENCES public.opinion_articles(id) ON DELETE CASCADE;
ALTER TABLE public.article_reports ADD CONSTRAINT article_reports_reporter_user_id_fkey FOREIGN KEY (reporter_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.likes ADD CONSTRAINT likes_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.articles(id) ON DELETE CASCADE;
ALTER TABLE public.likes ADD CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.comments ADD CONSTRAINT comments_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.articles(id) ON DELETE CASCADE;
ALTER TABLE public.comments ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.shares ADD CONSTRAINT shares_article_id_fkey FOREIGN KEY (article_id) REFERENCES public.articles(id) ON DELETE CASCADE;
ALTER TABLE public.shares ADD CONSTRAINT shares_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.analytics_events ADD CONSTRAINT analytics_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.opinion_articles ADD CONSTRAINT opinion_articles_author_id_fkey FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.opinion_article_charts ADD CONSTRAINT opinion_article_charts_opinion_article_id_fkey FOREIGN KEY (opinion_article_id) REFERENCES public.opinion_articles(id) ON DELETE CASCADE;
ALTER TABLE public.opinion_likes ADD CONSTRAINT opinion_likes_opinion_article_id_fkey FOREIGN KEY (opinion_article_id) REFERENCES public.opinion_articles(id) ON DELETE CASCADE;
ALTER TABLE public.opinion_likes ADD CONSTRAINT opinion_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.opinion_comments ADD CONSTRAINT opinion_comments_opinion_article_id_fkey FOREIGN KEY (opinion_article_id) REFERENCES public.opinion_articles(id) ON DELETE CASCADE;
ALTER TABLE public.opinion_comments ADD CONSTRAINT opinion_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.opinion_corrections ADD CONSTRAINT opinion_corrections_opinion_article_id_fkey FOREIGN KEY (opinion_article_id) REFERENCES public.opinion_articles(id) ON DELETE CASCADE;
ALTER TABLE public.opinion_corrections ADD CONSTRAINT opinion_corrections_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.opinion_shares ADD CONSTRAINT opinion_shares_opinion_article_id_fkey FOREIGN KEY (opinion_article_id) REFERENCES public.opinion_articles(id) ON DELETE CASCADE;
ALTER TABLE public.opinion_shares ADD CONSTRAINT opinion_shares_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.opinion_analytics_events ADD CONSTRAINT opinion_analytics_events_opinion_article_id_fkey FOREIGN KEY (opinion_article_id) REFERENCES public.opinion_articles(id) ON DELETE CASCADE;
ALTER TABLE public.opinion_analytics_events ADD CONSTRAINT opinion_analytics_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.categories ADD CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id);
ALTER TABLE public.books ADD CONSTRAINT books_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.authors(id);
ALTER TABLE public.books ADD CONSTRAINT books_publisher_id_fkey FOREIGN KEY (publisher_id) REFERENCES public.publishers(id);
ALTER TABLE public.book_categories ADD CONSTRAINT book_categories_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;
ALTER TABLE public.book_categories ADD CONSTRAINT book_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;
ALTER TABLE public.book_variants ADD CONSTRAINT book_variants_book_id_fkey FOREIGN KEY (book_id) REFERENCES public.books(id) ON DELETE CASCADE;
ALTER TABLE public.inventory_ledger ADD CONSTRAINT inventory_ledger_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.book_variants(id);

-- ============================================================================
-- 4. INDEKS (di luar yang otomatis dari PK/UNIQUE)
-- ============================================================================
-- Catatan: 35 foreign key belum berindeks (advisor performa 0001); lihat
-- docs/decisions untuk pekerjaan lanjutan.

CREATE INDEX article_reports_article_id_idx ON public.article_reports USING btree (opinion_article_id);
CREATE INDEX article_reports_status_idx ON public.article_reports USING btree (status);
CREATE INDEX opinion_analytics_article_id_idx ON public.opinion_analytics_events USING btree (opinion_article_id);
CREATE INDEX opinion_analytics_created_at_idx ON public.opinion_analytics_events USING btree (created_at DESC);
CREATE INDEX opinion_analytics_event_type_idx ON public.opinion_analytics_events USING btree (event_type);
CREATE INDEX opinion_article_charts_article_id_idx ON public.opinion_article_charts USING btree (opinion_article_id);
CREATE INDEX opinion_articles_author_id_idx ON public.opinion_articles USING btree (author_id);
CREATE INDEX opinion_articles_published_at_idx ON public.opinion_articles USING btree (published_at DESC);
CREATE INDEX opinion_articles_status_idx ON public.opinion_articles USING btree (status);
CREATE INDEX opinion_likes_article_id_idx ON public.opinion_likes USING btree (opinion_article_id);
CREATE INDEX opinion_likes_user_id_idx ON public.opinion_likes USING btree (user_id);

-- ============================================================================
-- 5. FUNGSI & TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_variant_stock_qty()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  UPDATE book_variants
  SET stock_qty = stock_qty + NEW.delta
  WHERE id = NEW.variant_id;
  RETURN NEW;
END;
$function$;

-- Dipakai oleh migrasi editorial_studio_publication (tabel snapshot); disertakan di sini
-- karena fungsinya hidup di skema publik dan tidak dibuat oleh migrasi mana pun di repo.
CREATE OR REPLACE FUNCTION public.prevent_studio_snapshot_mutation()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  raise exception 'Published Studio snapshots are immutable';
end;
$function$;

-- Event trigger bawaan Supabase: mengaktifkan RLS otomatis pada tabel baru di skema public.
CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$;

CREATE TRIGGER articles_updated_at BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER opinion_articles_updated_at BEFORE UPDATE ON public.opinion_articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_inventory_ledger_insert AFTER INSERT ON public.inventory_ledger FOR EACH ROW EXECUTE FUNCTION update_variant_stock_qty();

-- ============================================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opinion_analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opinion_article_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opinion_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opinion_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opinion_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opinion_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opinion_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publishers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Tabel toko (authors, publishers, books, book_variants, categories, book_categories,
-- inventory_ledger): RLS aktif tanpa policy = tertutup untuk anon/authenticated; hanya
-- service_role yang bisa mengakses. Ini disengaja/aman, bukan kelalaian.

-- analytics_events
CREATE POLICY "Izinkan insert untuk logging analytics" ON public.analytics_events AS PERMISSIVE FOR INSERT TO anon, authenticated WITH CHECK (true);

-- articles
CREATE POLICY "Artikel publik bisa dibaca semua orang" ON public.articles AS PERMISSIVE FOR SELECT TO public USING ((is_published = true));
-- TEMUAN KRITIS: siapa pun yang sudah login (pendaftaran Google terbuka) bisa insert/update/delete artikel via REST API.
CREATE POLICY "Hanya user terautentikasi yang bisa menulis" ON public.articles AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- article_charts
CREATE POLICY "Chart publik hanya terbaca jika artikel terbit" ON public.article_charts AS PERMISSIVE FOR SELECT TO public USING ((EXISTS ( SELECT 1 FROM articles WHERE ((articles.id = article_charts.article_id) AND (articles.is_published = true)))));
-- TEMUAN KRITIS: sama — nama bilang "admin", kondisinya true untuk semua authenticated.
CREATE POLICY "Akses kelola chart hanya untuk admin terautentikasi" ON public.article_charts AS PERMISSIVE FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- article_corrections
CREATE POLICY "Koreksi approved bisa dibaca publik" ON public.article_corrections AS PERMISSIVE FOR SELECT TO public USING ((status = 'approved'::text));
CREATE POLICY "User authenticated bisa insert koreksi" ON public.article_corrections AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));
-- TEMUAN TINGGI: user mana pun bisa mengubah status/isi koreksi apa pun (termasuk menyetujui sendiri).
CREATE POLICY "Admin bisa manage koreksi" ON public.article_corrections AS PERMISSIVE FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- article_reports
CREATE POLICY "User bisa melihat laporan yang dia buat" ON public.article_reports AS PERMISSIVE FOR SELECT TO authenticated USING ((reporter_user_id = auth.uid()));
CREATE POLICY "User terautentikasi bisa melaporkan artikel" ON public.article_reports AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((reporter_user_id = auth.uid()));

-- comments
CREATE POLICY "Komentar publik bisa dibaca semua orang" ON public.comments AS PERMISSIVE FOR SELECT TO public USING (true);
-- TEMUAN SEDANG: with check (true) → user_id bisa dipalsukan (menulis komentar atas nama user lain).
CREATE POLICY "Hanya user terautentikasi yang bisa menulis komentar" ON public.comments AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (true);

-- likes
CREATE POLICY "User hanya bisa melihat like miliknya sendiri" ON public.likes AS PERMISSIVE FOR SELECT TO authenticated USING ((auth.uid() = user_id));
CREATE POLICY "User bisa menambahkan like" ON public.likes AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));
CREATE POLICY "User bisa membatalkan like" ON public.likes AS PERMISSIVE FOR DELETE TO authenticated USING ((auth.uid() = user_id));

-- shares
CREATE POLICY "Share count publik bisa dibaca semua orang" ON public.shares AS PERMISSIVE FOR SELECT TO public USING (true);
-- TEMUAN RENDAH: with check (true) → bisa membanjiri jumlah share atas artikel mana pun.
CREATE POLICY "Hanya user terautentikasi yang bisa mencatat share" ON public.shares AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (true);

-- user_profiles
CREATE POLICY "Profil user bisa dibaca semua orang" ON public.user_profiles AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY "User hanya bisa membuat profil sendiri" ON public.user_profiles AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));
CREATE POLICY "User hanya bisa mengubah profil sendiri" ON public.user_profiles AS PERMISSIVE FOR UPDATE TO authenticated USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));

-- opinion_articles
CREATE POLICY "Artikel opinions published bisa dibaca semua orang" ON public.opinion_articles AS PERMISSIVE FOR SELECT TO public USING ((status = 'published'::text));
CREATE POLICY "public can view published opinion articles" ON public.opinion_articles AS PERMISSIVE FOR SELECT TO public USING ((status = 'published'::text)); -- duplikat persis dari di atas
CREATE POLICY "Penulis bisa membaca semua artikel miliknya" ON public.opinion_articles AS PERMISSIVE FOR SELECT TO authenticated USING ((author_id = auth.uid()));
CREATE POLICY "Penulis bisa membuat artikel" ON public.opinion_articles AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((author_id = auth.uid()));
CREATE POLICY "Penulis bisa mengubah artikel miliknya" ON public.opinion_articles AS PERMISSIVE FOR UPDATE TO authenticated USING ((author_id = auth.uid())) WITH CHECK ((author_id = auth.uid()));
CREATE POLICY "Penulis bisa menghapus draft miliknya" ON public.opinion_articles AS PERMISSIVE FOR DELETE TO authenticated USING (((author_id = auth.uid()) AND (status = 'draft'::text)));
-- Catatan: penulis bisa UPDATE kolom status miliknya sendiri langsung via REST (mis. draft→published melewati moderasi). Pertimbangkan trigger pembatas.

-- opinion_article_charts
CREATE POLICY "Chart opinions bisa dibaca jika artikel published" ON public.opinion_article_charts AS PERMISSIVE FOR SELECT TO public USING ((EXISTS ( SELECT 1 FROM opinion_articles WHERE ((opinion_articles.id = opinion_article_charts.opinion_article_id) AND (opinion_articles.status = 'published'::text)))));
CREATE POLICY "Penulis bisa membaca chart artikelnya" ON public.opinion_article_charts AS PERMISSIVE FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1 FROM opinion_articles WHERE ((opinion_articles.id = opinion_article_charts.opinion_article_id) AND (opinion_articles.author_id = auth.uid())))));
CREATE POLICY "Penulis bisa membuat chart untuk artikelnya" ON public.opinion_article_charts AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1 FROM opinion_articles WHERE ((opinion_articles.id = opinion_article_charts.opinion_article_id) AND (opinion_articles.author_id = auth.uid())))));
CREATE POLICY "Penulis bisa mengubah chart artikelnya" ON public.opinion_article_charts AS PERMISSIVE FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1 FROM opinion_articles WHERE ((opinion_articles.id = opinion_article_charts.opinion_article_id) AND (opinion_articles.author_id = auth.uid())))));
CREATE POLICY "Penulis bisa menghapus chart artikelnya" ON public.opinion_article_charts AS PERMISSIVE FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1 FROM opinion_articles WHERE ((opinion_articles.id = opinion_article_charts.opinion_article_id) AND (opinion_articles.author_id = auth.uid())))));

-- opinion_likes
CREATE POLICY "Likes opinions bisa dibaca semua orang" ON public.opinion_likes AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY "User bisa menambah like" ON public.opinion_likes AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));
CREATE POLICY "User bisa unlike" ON public.opinion_likes AS PERMISSIVE FOR DELETE TO authenticated USING ((user_id = auth.uid()));

-- opinion_comments
CREATE POLICY "Siapapun bisa membaca komentar opinions" ON public.opinion_comments AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY "User terautentikasi bisa mengirim komentar" ON public.opinion_comments AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));

-- opinion_corrections
CREATE POLICY "Koreksi disetujui bisa dibaca publik" ON public.opinion_corrections AS PERMISSIVE FOR SELECT TO public USING ((status = 'approved'::text));
CREATE POLICY "User terautentikasi bisa submit koreksi" ON public.opinion_corrections AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));
-- TEMUAN TINGGI: user mana pun bisa mengubah koreksi opini apa pun.
CREATE POLICY "Admin bisa review koreksi opinions" ON public.opinion_corrections AS PERMISSIVE FOR UPDATE TO authenticated USING (true);

-- opinion_shares
CREATE POLICY "Siapapun bisa membaca data share opinions" ON public.opinion_shares AS PERMISSIVE FOR SELECT TO public USING (true);
CREATE POLICY "User terautentikasi bisa mencatat share" ON public.opinion_shares AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));

-- opinion_analytics_events
CREATE POLICY "Siapa saja bisa mengirim analytics event" ON public.opinion_analytics_events AS PERMISSIVE FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Penulis bisa membaca analytics artikel miliknya" ON public.opinion_analytics_events AS PERMISSIVE FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1 FROM opinion_articles WHERE ((opinion_articles.id = opinion_analytics_events.opinion_article_id) AND (opinion_articles.author_id = auth.uid())))));
