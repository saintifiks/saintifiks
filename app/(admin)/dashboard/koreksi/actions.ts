'use server'

import { createClient } from '@/lib/supabase/server'

// Submit koreksi baru dari pembaca
export async function submitCorrection(data: {
  article_id: string
  original_text: string
  corrected_text: string
  explanation: string
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Anda harus login untuk mengusulkan koreksi.' }

  const { error } = await supabase
    .from('article_corrections')
    .insert({
      article_id: data.article_id,
      user_id: user.id,
      original_text: data.original_text.trim(),
      corrected_text: data.corrected_text.trim(),
      explanation: data.explanation.trim() || null,
      status: 'pending'
    })

  if (error) {
    return { error: `Gagal mengirim koreksi: ${error.message}` }
  }

  return { sukses: true }
}
