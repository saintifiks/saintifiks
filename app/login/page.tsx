// /login adalah alamat lama. Semua orang kini masuk lewat /masuk; peran menentukan tujuan.
// Dipertahankan agar tautan lama dan pengalihan admin (redirect('/login')) tetap bekerja.

import { redirect } from 'next/navigation'

export default function LoginPage() {
  redirect('/masuk?next=/dashboard')
}
