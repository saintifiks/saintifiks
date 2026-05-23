// Banner statis yang muncul di atas setiap artikel opinions
// Tidak ada interaksi — hanya teks informasional

export default function OpinionLabel() {
  return (
    <div className="my-8 border-l-4 border-accent-blue bg-accent-blue/5 px-5 py-4">
      <p className="font-helvetica text-sm text-primary-dark/70 leading-relaxed">
        <span className="font-bold text-accent-blue mr-1">Opini.</span>
        Artikel ini adalah opini penulis dan tidak mencerminkan pandangan redaksi Saintifiks. Baca dengan kritis.
      </p>
    </div>
  )
}
