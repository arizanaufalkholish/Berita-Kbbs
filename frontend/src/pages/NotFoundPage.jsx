import { Link } from "react-router-dom";
import { useLang } from "../context/LangContext";

export default function NotFoundPage() {
  const { t } = useLang();
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-bold text-surface-200 mb-4">404</h1>
        <h2 className="text-xl font-bold text-surface-900 mb-2">{t("common.notFound")}</h2>
        <p className="text-surface-500 mb-6">
          Halaman yang Anda cari tidak ditemukan atau telah dipindahkan. Silakan kembali ke beranda.
        </p>
        <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors">
          ← {t("common.backHome")}
        </Link>
      </div>
    </div>
  );
}
