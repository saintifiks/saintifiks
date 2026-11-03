'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdmin } from '@/lib/admin-check'
import { revalidatePublicContent } from '@/lib/revalidate-content'
import {
  requiredString,
  optionalString,
  validateUUID,
  ValidationError,
} from '@/lib/security/validation'

// Submit koreksi baru dari pembaca
export async function submitCorrection(data: {
  article_id: string
  original_text: string
  corrected_text: string
  explanation?: string
}) {
  try {
    const articleId = validateUUID(data.article_id, 'Artikel')
    const originalText = requiredString(data.original_text, 'Teks asli', { min: 1, max: 2000 })
    const correctedText = requiredString(data.corrected_text, 'Teks usulan koreksi', { min: 1, max: 2000 })
    const explanation = optionalString(data.explanation, 'Penjelasan', { max: 2000 })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Anda harus login untuk mengusulkan koreksi.' }

    const { error } = await supabase
      .from('article_corrections')
      .insert({
        article_id: articleId,
        user_id: user.id,
        original_text: originalText,
        corrected_text: correctedText,
        explanation,
        status: 'pending',
      })

    if (error) {
      return { error: 'Gagal mengirim usulan koreksi ke sistem.' }
    }

    return { sukses: true }
  } catch (error) {
    if (error instanceof ValidationError) return { error: error.message }
    return { error: 'Terjadi kesalahan saat memproses koreksi.' }
  }
}

// Tinjau usulan koreksi pembaca (admin). Disetujui = tampil di artikel; ditolak = tidak tampil.
// Memakai klien admin karena RLS hanya mengizinkan pembaca menambah, bukan mengubah status.
export async function reviewCorrection(input: {
  kind: 'article' | 'opinion'
  id: string
  decision: 'approved' | 'rejected'
}) {
  try {
    if (!(await isAdmin())) return { error: 'Tidak diizinkan.' }
    const id = validateUUID(input.id, 'Koreksi')
    if (input.decision !== 'approved' && input.decision !== 'rejected') return { error: 'Keputusan tidak valid.' }

    const admin = createAdminClient()
    const table = input.kind === 'opinion' ? 'opinion_corrections' : 'article_corrections'
    const { data, error } = await admin
      .from(table)
      .update({
        status: input.decision,
        approved_at: input.decision === 'approved' ? new Date().toISOString() : null,
      })
      .eq('id', id)
      .eq('status', 'pending')
      .select('id')
      .maybeSingle()

    if (error) return { error: 'Gagal menyimpan keputusan.' }
    if (!data) return { error: 'Usulan ini sudah ditinjau.' }

    if (input.kind === 'article') revalidatePublicContent()
    revalidatePath('/dashboard/koreksi')
    revalidatePath('/dashboard')
    return { sukses: true }
  } catch (error) {
    if (error instanceof ValidationError) return { error: error.message }
    return { error: 'Terjadi kesalahan saat meninjau koreksi.' }
  }
}
