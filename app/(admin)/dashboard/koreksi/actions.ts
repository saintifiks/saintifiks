'use server'

import { createClient } from '@/lib/supabase/server'
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
