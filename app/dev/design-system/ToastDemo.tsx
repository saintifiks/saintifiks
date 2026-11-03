'use client'

import { Button, useToast } from '@/components/ui'

export default function ToastDemo() {
  const toast = useToast()
  return (
    <div className="flex flex-wrap gap-3">
      <Button variant="secondary" onClick={() => toast({ message: 'Tautan disalin' })}>
        Netral
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast({
            message: 'Disimpan ke Daftar Bacaan',
            tone: 'success',
            action: { label: 'Lihat', href: '/akun' },
          })
        }
      >
        Sukses + tindakan
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast({
            message: 'Gagal menyimpan. Periksa koneksi lalu coba lagi.',
            tone: 'danger',
            action: { label: 'Coba lagi', onClick: () => toast({ message: 'Mencoba lagi…' }) },
          })
        }
      >
        Gagal + coba lagi
      </Button>
    </div>
  )
}
