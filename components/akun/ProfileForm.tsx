'use client'

// ProfileForm — ubah nama tampil, bio, dan foto profil. Nama pengguna tidak bisa diubah karena menjadi bagian
// alamat semua tulisan Argumen Anda.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Field, Input, Textarea, useToast } from '@/components/ui'
import StudioImageUpload from '@/components/editorial-studio/StudioImageUpload'

type ProfileFormProps = {
  userId: string
  username: string
  initialDisplayName: string
  initialBio: string
  initialAvatarUrl: string
}

export default function ProfileForm({ userId, username, initialDisplayName, initialBio, initialAvatarUrl }: ProfileFormProps) {
  const router = useRouter()
  const toast = useToast()
  const [displayName, setDisplayName] = useState(initialDisplayName)
  const [bio, setBio] = useState(initialBio)
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState({ displayName: initialDisplayName, bio: initialBio, avatarUrl: initialAvatarUrl })
  const [error, setError] = useState('')

  const dirty = displayName !== saved.displayName || bio !== saved.bio || avatarUrl !== saved.avatarUrl

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!displayName.trim()) {
      setError('Nama tampil wajib diisi.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/user-profiles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: displayName, bio, avatar_url: avatarUrl }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Profil belum berhasil disimpan.')
        return
      }
      setSaved({ displayName: displayName.trim(), bio: bio.trim(), avatarUrl })
      toast({ message: 'Profil tersimpan.', tone: 'success', label: 'Tersimpan' })
      router.refresh()
    } catch {
      setError('Terjadi gangguan. Coba lagi sebentar lagi.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="max-w-xl space-y-9">
      <StudioImageUpload
        label="Foto profil"
        value={avatarUrl || null}
        onChange={(url) => setAvatarUrl(url ?? '')}
        previewAlt="Foto profil"
        storage={{ bucket: 'opinions-gambar', folder: userId }}
      />

      <Field label="Nama tampil" required hint="Tampil di setiap tulisan Argumen Anda.">
        <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={100} autoComplete="name" />
      </Field>

      <Field label="Bio" hint={`${bio.length}/500 · tampil di halaman penulis Anda.`}>
        <Textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={500} rows={4} />
      </Field>

      <div>
        <p className="font-interface text-sm font-semibold text-text-primary">Nama pengguna</p>
        <p className="mt-1 font-mono text-caption text-text-secondary">@{username}</p>
        <p className="mt-1.5 font-interface text-caption text-text-secondary">
          Tidak bisa diubah karena menjadi bagian alamat tulisan Anda.
        </p>
      </div>

      {error && (
        <p role="alert" className="border-l border-signal-danger pl-4 font-interface text-sm text-signal-danger">
          {error}
        </p>
      )}

      <div className="flex items-center gap-6">
        <Button type="submit" disabled={saving || !dirty}>
          {saving ? 'Menyimpan' : 'Simpan profil'}
        </Button>
        {!dirty && <span className="font-mono text-caption text-text-tertiary">Tidak ada perubahan</span>}
      </div>
    </form>
  )
}
