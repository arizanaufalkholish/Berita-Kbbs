import { useEffect, useState } from "react";
import { useLang } from "../context/LangContext";
import { apiGetArticles } from "../services/api";
import ArticleCard from "../components/ArticleCard";

export default function OpiniPage() {
  const { t } = useLang();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetArticles("?category=opini")
      .then(res => setArticles(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="news-divider-bold mb-4" />
        <h1 className="text-2xl font-bold text-surface-900 mb-6">{t("nav.opini") || "Opini"}</h1>
        
        {loading ? (
          <p>Memuat opini...</p>
        ) : (
          <div className="bg-white border border-surface-200 rounded-lg p-2">
            <div className="divide-y divide-surface-100">
              {articles.length > 0 ? (
                articles.map(a => <ArticleCard key={a.id} article={a} variant="list" />)
              ) : (
                <div className="p-6 text-center text-surface-500">Belum ada opini yang dipublikasikan.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
