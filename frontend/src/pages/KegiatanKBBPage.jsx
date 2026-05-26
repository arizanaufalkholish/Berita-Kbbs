import { useLang } from "../context/LangContext";

export default function KegiatanKBBPage() {
  const { t } = useLang();
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="news-divider-bold mb-4" />
        <h1 className="text-2xl font-bold text-surface-900 mb-6">{t("nav.kegiatan")}</h1>
        <div className="bg-white border border-surface-200 p-6">
          <p className="text-surface-600 leading-relaxed">
            Halaman ini sedang dalam tahap pengembangan. Konten untuk {t("nav.kegiatan")} akan segera tersedia.
          </p>
        </div>
      </div>
    </div>
  );
}
