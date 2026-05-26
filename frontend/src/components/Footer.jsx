import { Link } from "react-router-dom";
import { useCategories } from "../context/CategoriesContext";
import { useLang } from "../context/LangContext";

export default function Footer() {
  const { t } = useLang();
  const { categories } = useCategories();
  return (
    <footer className="bg-surface-900 text-surface-400 mt-12" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4">
        <div className="py-10 grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-sm bg-primary-700 flex items-center justify-center"><span className="text-white font-bold text-sm">KBB</span></div>
              <span className="text-white font-bold">KBB SADUNIA</span>
            </div>
            <p className="text-sm leading-relaxed">Portal berita terlengkap seputar Kerukunan Bubuhan Banjar (KBB) Sadunia.</p>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-3">{t("footer.navigation")}</h4>
            <ul className="space-y-1.5 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">{t("nav.home")}</Link></li>
              <li><Link to="/terkini" className="hover:text-white transition-colors">{t("nav.latest")}</Link></li>
              <li><Link to="/donasi" className="hover:text-white transition-colors">{t("nav.donate")}</Link></li>
              <li><Link to="/kontak" className="hover:text-white transition-colors">{t("nav.contact")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-3">{t("nav.about")}</h4>
            <ul className="space-y-1.5 text-sm">
              <li><Link to="/tentang/sejarah" className="hover:text-white transition-colors">{t("nav.sejarah")}</Link></li>
              <li><Link to="/tentang/susunan-pengurus" className="hover:text-white transition-colors">{t("nav.hukum")}</Link></li>
              <li><Link to="/tentang/pelantikan" className="hover:text-white transition-colors">{t("nav.pelantikan")}</Link></li>
              <li><Link to="/tentang/opini" className="hover:text-white transition-colors">{t("nav.opini")}</Link></li>
              <li><Link to="/tentang/kegiatan" className="hover:text-white transition-colors">{t("nav.kegiatan")}</Link></li>
              <li><Link to="/tentang/administrasi" className="hover:text-white transition-colors">{t("nav.administrasi")}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-3">{t("footer.categories")}</h4>
            <ul className="space-y-1.5 text-sm">
              {categories.slice(0, 6).map((c) => (
                <li key={c.slug}><Link to={`/kategori/${c.slug}`} className="hover:text-white transition-colors">{c.name}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold mb-3">{t("footer.followUs")}</h4>
            <ul className="space-y-1.5 text-sm">
              <li><a href="#" className="hover:text-white transition-colors" aria-label="Facebook">Facebook</a></li>
              <li><a href="#" className="hover:text-white transition-colors" aria-label="Twitter">Twitter / X</a></li>
              <li><a href="#" className="hover:text-white transition-colors" aria-label="Instagram">Instagram</a></li>
              <li><a href="#" className="hover:text-white transition-colors" aria-label="YouTube">YouTube</a></li>
              <li><a href="/rss.xml" className="hover:text-white transition-colors" aria-label="RSS Feed">📡 RSS Feed</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-surface-800 py-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs">
          <p>&copy; 2026 KBB SADUNIA. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/kebijakan-privasi" className="hover:text-white transition-colors">{t("footer.privacy")}</Link>
            <Link to="/about" className="hover:text-white transition-colors">{t("footer.guidelines")}</Link>
            <Link to="/about" className="hover:text-white transition-colors">{t("footer.disclaimer")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
