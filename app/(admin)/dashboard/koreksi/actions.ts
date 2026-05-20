'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

type HasilAksi = { error: string } | { sukses: true }

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

// Admin approve/reject koreksi
export async function reviewCorrection(correction_id: string, status: 'approved' | 'rejected') {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  const adminEmail = process.env.ADMIN_EMAIL
  
  if (!user || user.email !== adminEmail) {
    return { error: 'Hanya admin yang boleh mereview koreksi.' }
  }

  const { error } = await supabase
    .from('article_corrections')
    .update({ 
      status,
      approved_at: status === 'approved' ? new Date().toISOString() : null 
    })
    .eq('id', correction_id)

  if (error) return { error: error.message }

  return { sukses: true }
}