import { useLang } from "../context/LangContext";

export default function PelantikanPage() {
  const { t } = useLang();
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="news-divider-bold mb-4" />
        <h1 className="text-2xl font-bold text-surface-900 mb-6">{t("nav.pelantikan")}</h1>
        <div className="bg-white border border-surface-200 p-6 prose-article">
          <h2>Kegiatan Pelantikan Pengurus KBB Sadunia</h2>
          <p>
            Prosesi pelantikan pengurus Kerukunan Bubuhan Banjar selalu sarat dengan nilai-nilai budaya dan tradisi Banjar.
            Kegiatan ini tidak hanya menjadi simbol pengesahan pengurus baru, tetapi juga sebagai ajang silaturahmi akbar (halal bihalal) masyarakat Banjar.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 mb-6">
            <div className="bg-surface-50 p-4 border border-surface-200 rounded">
              <h4 className="font-bold text-primary-700 mt-0">Pelantikan Nasional</h4>
              <p className="text-sm text-surface-600">Pelantikan pengurus pusat KBB Sadunia dihadiri oleh tokoh-tokoh penting dan disaksikan langsung oleh para tetuha Banjar dari berbagai daerah.</p>
            </div>
            <div className="bg-surface-50 p-4 border border-surface-200 rounded">
              <h4 className="font-bold text-primary-700 mt-0">Pelantikan Wilayah/Daerah</h4>
              <p className="text-sm text-surface-600">Pelantikan kepengurusan tingkat wilayah (PW) dan daerah (PD) dilakukan di berbagai provinsi di Indonesia hingga ke luar negeri.</p>
            </div>
          </div>

          <h3>Momen Bersejarah</h3>
          <p>
            Sepanjang perjalanannya, KBB Sadunia telah menggelar berbagai kongres dan pelantikan bersejarah yang mengukuhkan 
            eksistensi Urang Banjar sebagai pilar penting pembangunan nasional.
          </p>
        </div>
      </div>
    </div>
  );
}
