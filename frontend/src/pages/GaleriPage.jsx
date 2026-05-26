import { useState, useEffect, useCallback } from "react";
import { galleryItems } from "../data/organization";
import { useLang } from "../context/LangContext";

export default function GaleriPage() {
  const { t } = useLang();
  const [filter, setFilter] = useState("all");
  const [lightbox, setLightbox] = useState(null);
  const albums = [...new Set(galleryItems.map((g) => g.album))];
  const filtered = filter === "all" ? galleryItems : galleryItems.filter((g) => g.album === filter);

  // Close lightbox on Escape key (keyboard accessibility)
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Escape") setLightbox(null);
  }, []);

  useEffect(() => {
    if (lightbox) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightbox, handleKeyDown]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="news-divider-bold mb-4" />
      <h1 className="text-2xl font-bold text-surface-900 mb-1">{t("gallery.title")}</h1>
      <p className="text-surface-500 mb-6">{t("gallery.desc")}</p>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-6" role="tablist" aria-label="Filter album galeri">
        <button onClick={() => setFilter("all")} role="tab" aria-selected={filter === "all"} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-all ${filter === "all" ? "bg-primary-600 text-white border-primary-600" : "bg-white text-surface-600 border-surface-200 hover:border-primary-300"}`}>{t("gallery.all")}</button>
        {albums.map((a) => (
          <button key={a} onClick={() => setFilter(a)} role="tab" aria-selected={filter === a} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-all ${filter === a ? "bg-primary-600 text-white border-primary-600" : "bg-white text-surface-600 border-surface-200 hover:border-primary-300"}`}>{a}</button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" role="tabpanel">
        {filtered.map((item) => (
          <button key={item.id} onClick={() => setLightbox(item)} className="group relative rounded-lg overflow-hidden cursor-pointer aspect-square text-left" aria-label={`Lihat: ${item.title}`}>
            <img src={item.src} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-end">
              <div className="p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full">
                {item.type === "video" && <span className="text-white text-lg mr-1" aria-hidden="true">▶</span>}
                <p className="text-white text-sm font-medium line-clamp-1">{item.title}</p>
                <p className="text-white/70 text-xs">{new Date(item.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in" onClick={() => setLightbox(null)} role="dialog" aria-modal="true" aria-label={lightbox.title}>
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox.src} alt={lightbox.title} className="w-full max-h-[75vh] object-contain rounded-lg" />
            <div className="mt-3 text-center">
              <p className="text-white font-medium">{lightbox.title}</p>
              <p className="text-white/50 text-sm">{lightbox.album} · {new Date(lightbox.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
            <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl font-light" aria-label="Tutup galeri">×</button>
          </div>
        </div>
      )}
    </div>
  );
}
