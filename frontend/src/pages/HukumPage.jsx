import { useLang } from "../context/LangContext";

export default function HukumPage() {
  const { t } = useLang();
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="news-divider-bold mb-4" />
        <h1 className="text-2xl font-bold text-surface-900 mb-6">{t("nav.hukum")}</h1>
        <div className="bg-white border border-surface-200 p-6 prose-article">
          <h2>Dasar Hukum Pembentukan</h2>
          <p>
            Perkumpulan Kerukunan Bubuhan Banjar Sadunia secara resmi diakui dan terdaftar 
            sebagai badan hukum yang sah di Negara Kesatuan Republik Indonesia berdasarkan perundang-undangan yang berlaku.
          </p>
          <ul>
            <li><strong>Akta Pendirian:</strong> Nomor 14 Tanggal 22 Agustus 2024</li>
            <li><strong>Notaris:</strong> H. Rahmat, S.H., M.Kn</li>
            <li><strong>Pengesahan Kemenkumham:</strong> SK Menkumham Nomor AHU-0008544.AH.01.07.TAHUN 2024</li>
          </ul>

          <h3>Susunan Pengurus</h3>
          <p>
            Struktur kepengurusan pusat KBB Sadunia terdiri dari berbagai tokoh masyarakat Banjar yang berdedikasi 
            untuk memajukan dan melestarikan kebudayaan Banjar.
          </p>
          <div className="bg-surface-50 p-4 border border-surface-200 rounded mt-4">
            <h4 className="font-bold text-surface-900 mt-0">Ketua Umum</h4>
            <p className="text-surface-700">Pangeran H. Sahbirin Noor (Paman Birin)</p>
            <h4 className="font-bold text-surface-900">Sekretaris Jenderal</h4>
            <p className="text-surface-700">Drs. H. Taufik Arbain, M.Si</p>
            <h4 className="font-bold text-surface-900">Dewan Pembina</h4>
            <p className="text-surface-700">Para Tokoh Tetuha Banjar Nasional</p>
          </div>
        </div>
      </div>
    </div>
  );
}
