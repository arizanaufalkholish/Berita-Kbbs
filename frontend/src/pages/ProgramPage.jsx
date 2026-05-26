import { programs } from "../data/organization";
import { useLang } from "../context/LangContext";

export default function ProgramPage() {
  const { t } = useLang();
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="news-divider-bold mb-4" />
      <h1 className="text-2xl font-bold text-surface-900 mb-1">{t("program.title")}</h1>
      <p className="text-surface-500 mb-8">{t("program.desc")}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {programs.map((p) => (
          <div key={p.id} className="bg-white rounded-lg border border-surface-200 p-5 hover:shadow-lg hover:border-primary-200 transition-all duration-300 group">
            <div className="flex items-start gap-4">
              <span className="text-3xl shrink-0 group-hover:scale-110 transition-transform">{p.icon}</span>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-surface-900">{p.title}</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700 uppercase">Aktif</span>
                </div>
                <p className="text-sm text-surface-600 leading-relaxed mb-3">{p.desc}</p>
                {p.beneficiaries && (
                  <div className="flex items-center gap-1 text-xs text-primary-600 font-medium">
                    <span>👥</span> {p.beneficiaries.toLocaleString("id-ID")} penerima manfaat
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
