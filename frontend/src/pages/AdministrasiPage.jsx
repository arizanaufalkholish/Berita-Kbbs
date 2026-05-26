import { useLang } from "../context/LangContext";

export default function AdministrasiPage() {
  const { t } = useLang();
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="news-divider-bold mb-4" />
        <h1 className="text-2xl font-bold text-surface-900 mb-6">{t("nav.administrasi")}</h1>
        <div className="bg-white border border-surface-200 p-6 prose-article">
          <h2>Administrasi & Sekretariat</h2>
          <p>
            Pusat administrasi Kerukunan Bubuhan Banjar (KBB) Sadunia berfungsi sebagai pusat kendali operasional, 
            koordinasi antar wilayah, serta pusat informasi keanggotaan.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="bg-surface-50 p-4 border border-surface-200 rounded">
              <h3 className="text-lg font-bold text-surface-900 mt-0 mb-3 border-b border-surface-200 pb-2">Kontak Sekretariat</h3>
              <ul className="list-none pl-0 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 mt-1">📍</span>
                  <span className="text-surface-700"><strong>Alamat:</strong><br/>Jl. Sekretariat KBB Pusat, Banjarmasin, Kalimantan Selatan</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 mt-1">📞</span>
                  <span className="text-surface-700"><strong>Telepon:</strong><br/>(0511) 1234567</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-600 mt-1">✉️</span>
                  <span className="text-surface-700"><strong>Email:</strong><br/>sekretariat@hulusungai.news</span>
                </li>
              </ul>
            </div>

            <div className="bg-surface-50 p-4 border border-surface-200 rounded">
              <h3 className="text-lg font-bold text-surface-900 mt-0 mb-3 border-b border-surface-200 pb-2">Layanan Administrasi</h3>
              <ul className="text-surface-700">
                <li>Pendaftaran Keanggotaan Baru</li>
                <li>Pengesahan Surat Keputusan (SK) Wilayah</li>
                <li>Pusat Bantuan Hukum Anggota</li>
                <li>Informasi Program dan Kemitraan</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
