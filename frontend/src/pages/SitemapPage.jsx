import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiGetSitemap } from "../services/api";
import { Helmet } from "react-helmet-async";

export default function SitemapPage() {
  const [data, setData] = useState({ articles: [], categories: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSitemap = async () => {
      try {
        const res = await apiGetSitemap();
        setData(res.data || { articles: [], categories: [] });
      } catch (err) {
        console.error("Failed to load sitemap:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSitemap();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Sitemap - HuluSungai News</title>
        <meta name="description" content="Peta Situs HuluSungai News. Temukan seluruh artikel dan kategori." />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="news-divider-bold mb-4" />
        <h1 className="text-3xl font-bold text-surface-900 mb-6">Peta Situs (Sitemap)</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-bold text-surface-900 mb-4 border-b border-surface-200 pb-2">Kategori</h2>
            <ul className="space-y-2">
              {data.categories.map((c) => (
                <li key={c.slug}>
                  <Link to={`/kategori/${c.slug}`} className="text-primary-600 hover:text-primary-800 hover:underline">
                    /kategori/{c.slug}
                  </Link>
                </li>
              ))}
            </ul>

            <h2 className="text-xl font-bold text-surface-900 mt-8 mb-4 border-b border-surface-200 pb-2">Halaman Utama</h2>
            <ul className="space-y-2">
              <li><Link to="/" className="text-primary-600 hover:text-primary-800 hover:underline">Beranda</Link></li>
              <li><Link to="/terkini" className="text-primary-600 hover:text-primary-800 hover:underline">Terkini</Link></li>
              <li><Link to="/profil" className="text-primary-600 hover:text-primary-800 hover:underline">Profil</Link></li>
              <li><Link to="/program" className="text-primary-600 hover:text-primary-800 hover:underline">Program</Link></li>
              <li><Link to="/kontak" className="text-primary-600 hover:text-primary-800 hover:underline">Kontak</Link></li>
              <li><Link to="/donasi" className="text-primary-600 hover:text-primary-800 hover:underline">Donasi</Link></li>
              <li><Link to="/auth" className="text-primary-600 hover:text-primary-800 hover:underline">Masuk / Daftar</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-surface-900 mb-4 border-b border-surface-200 pb-2">Semua Artikel</h2>
            <ul className="space-y-2 max-h-96 overflow-y-auto pr-4 custom-scrollbar">
              {data.articles.map((a) => (
                <li key={a.slug} className="flex flex-col mb-2">
                  <Link to={`/article/${a.slug}`} className="text-primary-600 hover:text-primary-800 hover:underline text-sm">
                    /article/{a.slug}
                  </Link>
                  <span className="text-[10px] text-surface-400">Update: {new Date(a.updated_at).toLocaleDateString()}</span>
                </li>
              ))}
              {data.articles.length === 0 && <li className="text-surface-500 text-sm">Belum ada artikel</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
