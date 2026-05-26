export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="news-divider-bold mb-4" />
        <h1 className="text-2xl font-bold text-surface-900 mb-6">Tentang HuluSungai News</h1>

        <div className="bg-white rounded-lg border border-surface-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-surface-900 mb-3">Redaksi</h2>
          <p className="text-surface-600 leading-relaxed mb-3">HuluSungai News adalah portal berita digital yang menyajikan informasi terkini, akurat, dan mendalam tentang wilayah Hulu Sungai dan Kalimantan Selatan. Kami berkomitmen menjunjung tinggi etika jurnalisme dan Pedoman Media Siber.</p>
          <p className="text-surface-600 leading-relaxed">Redaksi kami terdiri dari jurnalis profesional yang berpengalaman meliput isu-isu lokal dengan perspektif mendalam.</p>
        </div>

        <div className="bg-white rounded-lg border border-surface-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-surface-900 mb-3">Pedoman Pemberitaan</h2>
          <ul className="space-y-2 text-surface-600 text-sm">
            <li className="flex gap-2"><span className="text-primary-600 font-bold">✓</span> Menjunjung akurasi dan keberimbangan dalam setiap pemberitaan</li>
            <li className="flex gap-2"><span className="text-primary-600 font-bold">✓</span> Menghormati privasi dan asas praduga tak bersalah</li>
            <li className="flex gap-2"><span className="text-primary-600 font-bold">✓</span> Memberikan hak jawab kepada pihak yang diberitakan</li>
            <li className="flex gap-2"><span className="text-primary-600 font-bold">✓</span> Independen dari kepentingan politik dan komersial</li>
            <li className="flex gap-2"><span className="text-primary-600 font-bold">✓</span> Terdaftar di Dewan Pers Indonesia</li>
          </ul>
        </div>

        <div className="bg-white rounded-lg border border-surface-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-surface-900 mb-3">Teknologi</h2>
          <p className="text-surface-600 text-sm mb-4">Website ini dibangun dengan arsitektur Headless CMS modern:</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { name: "React", desc: "Frontend UI" },
              { name: "TailwindCSS", desc: "Styling" },
              { name: "Node.js", desc: "Runtime" },
              { name: "PHP", desc: "Backend API" },
              { name: "WordPress", desc: "CMS" },
              { name: "MySQL", desc: "Database" },
            ].map((t) => (
              <div key={t.name} className="p-3 rounded-lg bg-surface-50 border border-surface-200">
                <p className="font-bold text-surface-900 text-sm">{t.name}</p>
                <p className="text-xs text-surface-500">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-surface-200 p-6">
          <h2 className="text-lg font-bold text-surface-900 mb-3">Kontak Redaksi</h2>
          <div className="space-y-2 text-sm text-surface-600">
            <p><strong className="text-surface-800">Email:</strong> redaksi@hulusungai.news</p>
            <p><strong className="text-surface-800">Telepon:</strong> (0517) 123-4567</p>
            <p><strong className="text-surface-800">Alamat:</strong> Jl. A. Yani No. 1, Barabai, Hulu Sungai Tengah, Kalimantan Selatan 71313</p>
          </div>
        </div>
      </div>
    </div>
  );
}
