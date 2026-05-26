import { useSearchParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import ArticleCard from "../components/ArticleCard";
import { apiSearchArticles } from "../services/api";
import { Helmet } from "react-helmet-async";

export default function SearchPage() {
  const [params] = useSearchParams();
  const query = params.get("q") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await apiSearchArticles(query);
        setResults(res.data || []);
      } catch (err) {
        console.error("Failed to search:", err);
      } finally {
        setLoading(false);
      }
    };
    if (query) {
      fetchResults();
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      setLoading(false);
    }
  }, [query]);

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
        <title>Pencarian "{query}" - HuluSungai News</title>
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="news-divider-bold mb-4" />
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-surface-900 mb-1">Hasil Pencarian</h1>
          <p className="text-surface-500">
            {results.length > 0
              ? `Ditemukan ${results.length} artikel untuk "${query}"`
              : `Tidak ditemukan hasil untuk "${query}"`}
          </p>
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-lg border border-surface-200">
              <div className="divide-y divide-surface-100 px-4">
                {results.map((a) => (
                  <ArticleCard key={a.id} article={a} variant="list" />
                ))}
              </div>
            </div>
            <aside>
              <div className="bg-surface-50 rounded-lg p-5 border border-surface-200">
                <h3 className="font-bold text-surface-900 mb-3 text-sm">Coba cari:</h3>
                <div className="flex flex-wrap gap-2">
                  {["Banjir", "Wisata", "Loksado", "Pilkada", "Ekonomi", "Budaya", "Soto Banjar", "Pendidikan"].map((t) => (
                    <Link key={t} to={`/search?q=${t}`} className="px-3 py-1.5 rounded-full bg-white border border-surface-200 text-xs text-surface-600 hover:border-primary-300 hover:text-primary-600 transition-all">{t}</Link>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-surface-500 mb-6">Coba kata kunci lain atau jelajahi kategori berita.</p>
            <Link to="/" className="px-5 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors">Kembali ke Beranda</Link>
          </div>
        )}
      </div>
    </div>
  );
}
