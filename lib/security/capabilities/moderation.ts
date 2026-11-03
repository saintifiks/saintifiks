/**
 * Moderation Capability Module
 * Confines privileged service-role access for Opinions moderation.
 */

import { createAdminClient } from '@/lib/supabase/admin'

// Menyembunyikan tulisan Argumen = status 'published' → 'hidden'; menayangkan kembali = 'hidden' → 'published'.
// Perubahan hanya berlaku dari status asal yang benar, sehingga draf penulis tidak bisa ikut tertayang dan tulisan
// yang sudah disembunyikan tidak menimpa keputusan lain. Trigger opinion_articles_guard hanya membatasi pengguna
// biasa; service_role (jalur ini) lolos.
export async function setOpinionHiddenStatus(opinionId: string, isHidden: boolean) {
  const admin = createAdminClient()
  return admin
    .from('opinion_articles')
    .update({ status: isHidden ? 'hidden' : 'published' })
    .eq('id', opinionId)
    .eq('status', isHidden ? 'published' : 'hidden')
    .select('id, title, status')
    .single()
}
