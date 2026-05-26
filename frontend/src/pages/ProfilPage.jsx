import { orgProfile } from "../data/organization";
import { useLang } from "../context/LangContext";

export default function ProfilPage() {
  const { t } = useLang();
  const p = orgProfile;
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="news-divider-bold mb-4" />
      <h1 className="text-2xl font-bold text-surface-900 mb-6">{t("about.title")}</h1>

      <div className="bg-white rounded-lg border border-surface-200 p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-xl bg-primary-700 flex items-center justify-center text-white text-2xl font-bold">HS</div>
          <div>
            <h2 className="text-xl font-bold text-surface-900">{p.name}</h2>
            <p className="text-primary-600 font-medium italic">{p.tagline}</p>
            <p className="text-xs text-surface-400 mt-1">Didirikan: {p.founded} · No. Registrasi: {p.registration}</p>
          </div>
        </div>
        <h3 className="text-lg font-bold text-surface-900 mb-2">{t("about.history")}</h3>
        <p className="text-surface-600 leading-relaxed">{p.history}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-surface-200 p-6">
          <h3 className="text-lg font-bold text-surface-900 mb-3 flex items-center gap-2">🎯 {t("about.vision")}</h3>
          <p className="text-surface-600 leading-relaxed">{p.vision}</p>
        </div>
        <div className="bg-white rounded-lg border border-surface-200 p-6">
          <h3 className="text-lg font-bold text-surface-900 mb-3 flex items-center gap-2">🚀 {t("about.mission")}</h3>
          <ol className="space-y-2">
            {p.mission.map((m, i) => (
              <li key={i} className="flex gap-2 text-sm text-surface-600"><span className="text-primary-600 font-bold shrink-0">{i + 1}.</span>{m}</li>
            ))}
          </ol>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-surface-200 p-6">
        <h3 className="text-lg font-bold text-surface-900 mb-4">{t("about.values")}</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {p.values.map((v) => (
            <div key={v.title} className="p-4 rounded-lg bg-surface-50 border border-surface-100 hover:border-primary-200 hover:shadow-sm transition-all">
              <span className="text-2xl mb-2 block">{v.icon}</span>
              <h4 className="font-bold text-surface-900 text-sm">{v.title}</h4>
              <p className="text-xs text-surface-500 mt-1">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
