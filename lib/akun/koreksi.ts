import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'

// Usulan koreksi milik satu pembaca. Kolom user_id koreksi tidak terbaca publik (privasi pengirim), jadi data milik
// sendiri dibaca server dengan service_role dan disaring ke userId — panggil hanya dengan userId dari sesi yang sudah
// diverifikasi (auth.getUser), tidak pernah dari masukan klien.

const OPINION_REF = 'title, slug, status, user_profiles!opinion_articles_author_profile_fkey(username)'

export function getKoreksiSaya(userId: string, limit: number) {
  const admin = createAdminClient()
  return Promise.all([
    admin
      .from('article_corrections')
      .select('id, status, original_text, created_at, articles(title, slug)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit),
    admin
      .from('opinion_corrections')
      .select(`id, status, original_text, created_at, opinion_articles(${OPINION_REF})`)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit),
  ])
}
