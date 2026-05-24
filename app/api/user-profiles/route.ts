// API route: /api/user-profiles
// GET  — mengambil profil user yang sedang login
// POST — membuat profil baru (onboarding username)
// PATCH — mengupdate profil (display_name, bio, avatar_url)

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// Daftar username yang tidak boleh digunakan (reserved)
const RESERVED_USERNAMES = [
  'admin', 'api', 'akun', 'tulis', 'opinions',
  'penulis', 'login', 'auth', 'dashboard', 'artikel',
  'koreksi', 'null', 'undefined',
]

// Validasi format username: hanya huruf kecil, angka, tanda hubung, 3-30 karakter
function isValidUsernameFormat(username: string): boolean {
  return /^[a-z0-9][a-z0-9\-]{1,28}[a-z0-9]$/.test(username)
}

// GET — ambil profil user yang sedang login
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('user_id, username, display_name, bio, avatar_url, created_at, updated_at')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      console.error('[user-profiles GET] Error:', error.message)
      return NextResponse.json({ error: 'Gagal mengambil profil' }, { status: 500 })
    }

    if (!profile) {
      return NextResponse.json({ exists: false })
    }

    return NextResponse.json({ exists: true, profile })
  } catch (err) {
    console.error('[user-profiles GET] Unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST — buat profil baru (onboarding)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    const body = await request.json()
    const username = typeof body.username === 'string' ? body.username.trim().toLowerCase() : ''
    const displayName = typeof body.display_name === 'string' ? body.display_name.trim() : ''

    // Validasi username
    if (!username) {
      return NextResponse.json({ error: 'Username wajib diisi' }, { status: 400 })
    }
    if (!isValidUsernameFormat(username)) {
      return NextResponse.json({
        error: 'Username hanya boleh mengandung huruf kecil, angka, dan tanda hubung, minimal 3 karakter'
      }, { status: 400 })
    }
    if (RESERVED_USERNAMES.includes(username)) {
      return NextResponse.json({ error: 'Username tidak tersedia' }, { status: 400 })
    }

    // Validasi display_name
    if (!displayName) {
      return NextResponse.json({ error: 'Nama tampil wajib diisi' }, { status: 400 })
    }
    if (displayName.length > 100) {
      return NextResponse.json({ error: 'Nama tampil maksimal 100 karakter' }, { status: 400 })
    }

    // Cek apakah username sudah dipakai user lain
    const { data: existing } = await supabase
      .from('user_profiles')
      .select('username')
      .eq('username', username)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Username sudah digunakan' }, { status: 400 })
    }

    // Cek apakah user sudah punya profil
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (existingProfile) {
      return NextResponse.json({ error: 'Profil sudah ada' }, { status: 400 })
    }

    // Buat profil baru
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: user.id,
        username,
        display_name: displayName,
      })
      .select()
      .single()

    if (error) {
      console.error('[user-profiles POST] Error:', error.message)
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Username sudah digunakan' }, { status: 400 })
      }
      return NextResponse.json({ error: 'Gagal membuat profil' }, { status: 500 })
    }

    return NextResponse.json({ profile }, { status: 201 })
  } catch (err) {
    console.error('[user-profiles POST] Unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PATCH — update profil (hanya display_name, bio, avatar_url — username tidak bisa diubah)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 })
    }

    const body = await request.json()

    // Bangun object update — abaikan username meski dikirim di request body
    const updates: Record<string, string> = {}

    if (typeof body.display_name === 'string') {
      const displayName = body.display_name.trim()
      if (!displayName) {
        return NextResponse.json({ error: 'Nama tampil tidak boleh kosong' }, { status: 400 })
      }
      if (displayName.length > 100) {
        return NextResponse.json({ error: 'Nama tampil maksimal 100 karakter' }, { status: 400 })
      }
      updates.display_name = displayName
    }

    if (typeof body.bio === 'string') {
      const bio = body.bio.trim()
      if (bio.length > 500) {
        return NextResponse.json({ error: 'Bio maksimal 500 karakter' }, { status: 400 })
      }
      updates.bio = bio
    }

    if (typeof body.avatar_url === 'string') {
      const avatarUrl = body.avatar_url.trim()
      // Validasi URL: hanya izinkan https:// — blokir javascript:, data:, dan protocol-relative
      if (avatarUrl && !avatarUrl.startsWith('https://')) {
        return NextResponse.json({ error: 'URL avatar harus menggunakan HTTPS' }, { status: 400 })
      }
      updates.avatar_url = avatarUrl || null
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Tidak ada data yang diupdate' }, { status: 400 })
    }

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('[user-profiles PATCH] Error:', error.message)
      return NextResponse.json({ error: 'Gagal mengupdate profil' }, { status: 500 })
    }

    return NextResponse.json({ profile })
  } catch (err) {
    console.error('[user-profiles PATCH] Unexpected error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
