// ArgumenNote — catatan tetap di atas setiap tulisan Argumen: ini pendapat pembaca, bukan posisi redaksi.
// Tanpa latar berwarna; dua garis tipis dan huruf miring sudah cukup membedakannya dari isi tulisan.

export default function ArgumenNote({ className = '' }: { className?: string }) {
  return (
    <aside
      aria-label="Tentang Argumen"
      className={['border-y border-border-default/20 py-4', className].filter(Boolean).join(' ')}
    >
      <p className="font-display text-body-sm italic leading-relaxed text-text-secondary">
        <span className="font-interface text-kicker-lg font-semibold not-italic uppercase tracking-widest text-text-primary">
          Argumen
        </span>
        <span aria-hidden="true"> · </span>
        Pendapat pribadi penulis, bukan posisi redaksi, dan terbit tanpa penyuntingan redaksi. Baca dengan kritis.
      </p>
    </aside>
  )
}
