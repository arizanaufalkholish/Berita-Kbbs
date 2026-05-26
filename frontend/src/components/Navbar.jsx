import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCategories } from "../context/CategoriesContext";
import { useLang } from "../context/LangContext";

const orgLinks = [
  { key: "sejarah", path: "/tentang/sejarah" },
  { key: "hukum", path: "/tentang/susunan-pengurus" },
  { key: "pelantikan", path: "/tentang/pelantikan" },
  { key: "opini", path: "/tentang/opini" },
  { key: "kegiatan", path: "/tentang/kegiatan" },
  { key: "administrasi", path: "/tentang/administrasi" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [orgMenuOpen, setOrgMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { lang, toggleLang, t } = useLang();
  const { categories } = useCategories();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => { setMobileOpen(false); setOrgMenuOpen(false); }, [location]);

  const handleSearch = (e) => { e.preventDefault(); if (searchQuery.trim()) { navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`); } };

  const now = new Date();
  const dateStr = now.toLocaleDateString(lang === "id" ? "id-ID" : "en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <header className="sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-surface-900 text-surface-400 text-xs py-1.5 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <span>{dateStr}</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-white transition-colors">Facebook</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">Instagram</a>
            <span className="text-surface-700">|</span>
            {/* Lang toggle */}
            <button onClick={toggleLang} className="flex items-center gap-1 hover:text-white transition-colors font-medium" id="lang-toggle">
              🌐 {lang === "id" ? "EN" : "ID"}
            </button>
            <Link to="/auth" className="hover:text-white transition-colors font-medium">👤 {t("nav.login")}</Link>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className={`bg-white border-b border-surface-200 transition-shadow duration-300 ${scrolled ? "shadow-md" : ""}`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <Link to="/" className="flex items-center gap-2" id="nav-logo">
              <div className="w-9 h-9 rounded-sm bg-primary-700 flex items-center justify-center">
                <span className="text-white font-bold text-base">KBB</span>
              </div>
              <div className="leading-tight">
                <span className="text-xl font-bold text-surface-900 tracking-tight">KBB</span>
                <span className="text-[10px] text-primary-600 font-semibold tracking-widest uppercase block -mt-0.5">SADUNIA</span>
              </div>
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-sm mx-6">
              <div className="relative w-full">
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t("nav.search")}
                  className="w-full pl-4 pr-10 py-1.5 rounded-sm bg-surface-100 border border-surface-200 text-sm placeholder:text-surface-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-all" />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-surface-400 hover:text-primary-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
              </div>
            </form>

            <div className="flex items-center gap-2">
              <Link to="/donasi" className="hidden md:inline-flex px-4 py-1.5 rounded-sm bg-accent-500 text-white text-sm font-bold hover:bg-accent-600 transition-colors">❤️ {t("nav.donate")}</Link>
              <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-surface-500 hover:text-surface-900">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>
            </div>
          </div>

          {/* Nav tabs */}
          <div className="hidden md:flex items-center gap-0 -mb-px overflow-x-auto">
            <Link to="/" className={`px-3 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${location.pathname === "/" ? "border-primary-600 text-primary-700" : "border-transparent text-surface-600 hover:text-surface-900 hover:border-surface-300"}`}>{t("nav.home")}</Link>
            <Link to="/terkini" className={`px-3 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${location.pathname === "/terkini" ? "border-primary-600 text-primary-700" : "border-transparent text-surface-600 hover:text-surface-900 hover:border-surface-300"}`}>{t("nav.latest")}</Link>

            {/* Org dropdown */}
            <div className="relative" onMouseEnter={() => setOrgMenuOpen(true)} onMouseLeave={() => setOrgMenuOpen(false)}>
              <button 
                onClick={() => setOrgMenuOpen(!orgMenuOpen)}
                className={`px-3 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1 ${location.pathname.startsWith("/tentang") ? "border-primary-600 text-primary-700" : "border-transparent text-surface-600 hover:text-surface-900"}`}>
                {t("nav.about")} <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {orgMenuOpen && (
                <div className="absolute top-full left-0 bg-white border border-surface-200 shadow-md py-1 w-72 animate-fade-in z-50">
                  {orgLinks.map((l) => (
                    <Link key={l.path} to={l.path} className="block px-4 py-2 text-sm text-surface-800 hover:bg-surface-50 hover:text-primary-700 transition-colors border-b border-surface-50 last:border-b-0">{t(`nav.${l.key}`)}</Link>
                  ))}
                </div>
              )}
            </div>

            {categories.slice(0, 6).map((cat) => (
              <Link key={cat.slug} to={`/kategori/${cat.slug}`}
                className={`px-3 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${location.pathname === `/kategori/${cat.slug}` ? "border-primary-600 text-primary-700" : "border-transparent text-surface-600 hover:text-surface-900 hover:border-surface-300"}`}>{cat.name}</Link>
            ))}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-surface-200 animate-fade-in max-h-[80vh] overflow-y-auto">
            <form onSubmit={handleSearch} className="px-4 py-3 border-b border-surface-100">
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t("nav.search")}
                className="w-full px-4 py-2 rounded-sm bg-surface-100 border border-surface-200 text-sm focus:outline-none focus:border-primary-500" />
            </form>
            <div className="px-4 py-2">
              <Link to="/" className="block py-2.5 text-sm font-semibold text-surface-800 border-b border-surface-100">{t("nav.home")}</Link>
              <Link to="/terkini" className="block py-2.5 text-sm font-semibold text-surface-800 border-b border-surface-100">{t("nav.latest")}</Link>
              <p className="text-xs font-bold text-surface-400 uppercase tracking-wider mt-3 mb-1">{t("nav.about")}</p>
              {orgLinks.map((l) => (
                <Link key={l.path} to={l.path} className="block py-2 text-sm text-surface-700 border-b border-surface-100">{t(`nav.${l.key}`)}</Link>
              ))}
              <p className="text-xs font-bold text-surface-400 uppercase tracking-wider mt-3 mb-1">Kategori</p>
              {categories.map((cat) => (
                <Link key={cat.slug} to={`/kategori/${cat.slug}`} className="flex items-center gap-2 py-2 text-sm text-surface-700 border-b border-surface-100">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />{cat.name}
                </Link>
              ))}
              <div className="flex items-center justify-between mt-3 py-2">
                <Link to="/auth" className="text-sm text-primary-600 font-semibold">👤 {t("nav.login")}</Link>
                <button onClick={toggleLang} className="text-sm text-surface-600 font-medium">🌐 {lang === "id" ? "English" : "Indonesia"}</button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
