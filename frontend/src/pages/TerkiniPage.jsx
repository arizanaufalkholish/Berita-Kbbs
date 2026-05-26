import { useEffect, useState } from "react";
import { apiGetArticles, apiGetTrending } from "../services/api";
import ArticleCard from "../components/ArticleCard";

export default function TerkiniPage() {
  const [articles, setArticles] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [articlesRes, trendingRes] = await Promise.all([
          apiGetArticles(),
          apiGetTrending()
        ]);
        setArticles(articlesRes.data || []);
        setTrending(trendingRes.data || []);
      } catch (error) {
        console.error("Failed to fetch terkini data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [apiGetArticles, apiGetTrending]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="news-divider-bold mb-4" />
        <h1 className="text-2xl font-bold text-surface-900 mb-6">Berita Terkini</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-lg border border-surface-200">
            <div className="divide-y divide-surface-100 px-4">
              {articles.map((a) => (
                <ArticleCard key={a.id} article={a} variant="list" />
              ))}
            </div>
          </div>
          <aside>
            <div className="bg-white rounded-lg border border-surface-200 overflow-hidden sticky top-28">
              <div className="px-4 py-3 border-b border-surface-200 bg-surface-50">
                <h3 className="text-sm font-bold text-surface-900 uppercase tracking-wider">🔥 Terpopuler</h3>
              </div>
              <div className="p-3">
                {trending.map((a, i) => (
                  <div key={a.id} className="flex items-start gap-2 py-2.5 border-b border-surface-100 last:border-0">
                    <span className={`text-lg font-bold shrink-0 w-6 ${i === 0 ? "text-breaking" : "text-surface-300"}`}>{i + 1}</span>
                    <ArticleCard article={a} variant="side" />
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
