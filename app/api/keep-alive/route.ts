// API endpoint keep-alive — mencegah Supabase hibernasi
// Endpoint ini dipanggil otomatis oleh Vercel Cron Job setiap 3 hari
// Hanya melakukan query ringan (hitung artikel) tanpa mengubah data apapun

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Kunci keamanan: hanya Vercel Cron yang boleh memanggil endpoint ini
const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: Request) {
  // Verifikasi bahwa yang memanggil adalah Vercel Cron (bukan orang random)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = await createClient()
    
    // Query ringan: cukup ping database untuk mencegah hibernasi
    await supabase
      .from('keep_alive_ping')
      .select('id')
      .limit(1)

    // Jika tabel belum ada, tidak masalah — database tetap "terbangun"
    const timestamp = new Date().toISOString()
    console.log(`[Keep-Alive] Database ping berhasil pada ${timestamp}`)

    return NextResponse.json({ 
      status: 'ok', 
      message: 'Database berhasil di-ping',
      timestamp 
    })
  } catch (error) {
    console.error('[Keep-Alive] Error:', error)
    return NextResponse.json(
      { error: 'Keep-alive gagal' }, 
      { status: 500 }
    )
  }
}