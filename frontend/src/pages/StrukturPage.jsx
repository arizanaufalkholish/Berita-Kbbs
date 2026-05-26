import { orgStructure } from "../data/organization";
import { useLang } from "../context/LangContext";

export default function StrukturPage() {
  const { t } = useLang();
  const ketua = orgStructure[0];
  const wakil = orgStructure.slice(1, 3);
  const pengurus = orgStructure.slice(3);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="news-divider-bold mb-4" />
      <h1 className="text-2xl font-bold text-surface-900 mb-1">{t("structure.title")}</h1>
      <p className="text-surface-500 mb-8">{t("structure.desc")}</p>

      {/* Ketua */}
      <div className="flex justify-center mb-6">
        <div className="bg-primary-700 text-white rounded-xl p-5 text-center w-72 shadow-lg">
          <div className="w-16 h-16 mx-auto rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold mb-3">{ketua.name.charAt(0)}</div>
          <p className="font-bold text-lg">{ketua.name}</p>
          <p className="text-primary-200 text-sm mt-1">{ketua.role}</p>
        </div>
      </div>
      <div className="flex justify-center mb-2"><div className="w-0.5 h-6 bg-surface-300" /></div>

      {/* Wakil */}
      <div className="flex justify-center gap-4 mb-6 flex-wrap">
        {wakil.map((w) => (
          <div key={w.role} className="bg-white border-2 border-primary-200 rounded-xl p-4 text-center w-56">
            <div className="w-12 h-12 mx-auto rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-lg font-bold mb-2">{w.name.charAt(0)}</div>
            <p className="font-bold text-surface-900 text-sm">{w.name}</p>
            <p className="text-primary-600 text-xs mt-1">{w.role}</p>
          </div>
        ))}
      </div>
      <div className="flex justify-center mb-2"><div className="w-0.5 h-6 bg-surface-300" /></div>

      {/* Pengurus */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {pengurus.map((p) => (
          <div key={p.role} className="bg-white rounded-lg border border-surface-200 p-4 flex items-center gap-3 hover:shadow-md hover:border-primary-200 transition-all">
            <div className="w-10 h-10 rounded-full bg-surface-100 text-surface-600 flex items-center justify-center font-bold text-sm shrink-0">{p.name.charAt(0)}</div>
            <div>
              <p className="font-semibold text-surface-900 text-sm">{p.name}</p>
              <p className="text-xs text-surface-500">{p.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
