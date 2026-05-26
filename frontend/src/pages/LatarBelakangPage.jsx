// This page currently contains static Indonesian text. If localisation is
// required in the future, you can import `useLang` from the LangContext
// and call `t()` where appropriate. Leaving unused imports in the file
// triggers ESLint's `no-unused-vars` rule, so it has been removed.

export default function LatarBelakangPage() {
  // No translation hook needed as the content is statically written in Indonesian.
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="news-divider-bold mb-4" />
      <h1 className="text-2xl font-bold text-surface-900 mb-6">Latar Belakang</h1>
      <div className="bg-white rounded-lg border border-surface-200 p-6 space-y-4">
        <p className="text-surface-600 leading-relaxed">Wilayah Hulu Sungai di Kalimantan Selatan merupakan kawasan yang kaya akan sejarah, budaya, dan sumber daya alam. Terdiri dari tiga kabupaten — <strong>Hulu Sungai Utara (HSU)</strong>, <strong>Hulu Sungai Tengah (HST)</strong>, dan <strong>Hulu Sungai Selatan (HSS)</strong> — wilayah ini menjadi salah satu pusat peradaban suku Banjar.</p>
        <p className="text-surface-600 leading-relaxed">Seiring dengan arus urbanisasi dan globalisasi, banyak putra-putri daerah Hulu Sungai yang merantau ke berbagai kota besar di Indonesia bahkan ke luar negeri. Fenomena ini melahirkan kebutuhan akan wadah yang dapat mempererat tali silaturahmi dan menjaga identitas budaya di perantauan.</p>
        <h2 className="text-lg font-bold text-surface-900 pt-4">Mengapa Perkumpulan Ini Didirikan?</h2>
        <ul className="space-y-2 text-surface-600">
          <li className="flex gap-2"><span className="text-primary-600 font-bold shrink-0">1.</span>Kebutuhan wadah silaturahmi dan komunikasi antar warga Hulu Sungai di perantauan.</li>
          <li className="flex gap-2"><span className="text-primary-600 font-bold shrink-0">2.</span>Keinginan untuk turut berkontribusi dalam pembangunan daerah asal melalui program sosial dan pendidikan.</li>
          <li className="flex gap-2"><span className="text-primary-600 font-bold shrink-0">3.</span>Upaya pelestarian bahasa, budaya, dan tradisi Banjar Hulu Sungai yang mulai tergerus modernisasi.</li>
          <li className="flex gap-2"><span className="text-primary-600 font-bold shrink-0">4.</span>Membangun jaringan ekonomi dan profesional antar anggota untuk saling mendukung.</li>
          <li className="flex gap-2"><span className="text-primary-600 font-bold shrink-0">5.</span>Menyediakan bantuan tanggap darurat saat terjadi bencana alam di wilayah Hulu Sungai.</li>
        </ul>
        <h2 className="text-lg font-bold text-surface-900 pt-4">Perkembangan Organisasi</h2>
        <p className="text-surface-600 leading-relaxed">Sejak didirikan pada tahun 2010, Perkumpulan Hulu Sungai telah berkembang dari kelompok kecil beranggotakan 30 orang menjadi organisasi nasional dengan <strong>15 cabang</strong> di kota-kota besar Indonesia dan <strong>5 perwakilan</strong> di luar negeri (Malaysia, Brunei, Arab Saudi, Australia, Jepang). Total anggota aktif saat ini mencapai <strong>3.500+ orang</strong>.</p>
        <p className="text-surface-600 leading-relaxed">Organisasi ini telah berhasil menyalurkan lebih dari <strong>Rp 5 miliar</strong> dalam bentuk beasiswa, bantuan sosial, dan dana bencana selama perjalanannya. Prestasi ini tidak lepas dari semangat <em>gotong royong</em> dan <em>bubuhan</em> (kebersamaan) yang menjadi ciri khas masyarakat Banjar.</p>
      </div>
    </div>
  );
}
