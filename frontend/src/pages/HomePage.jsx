import { useEffect, useState } from "react";
import ArticleCard from "../components/ArticleCard";
import { Link } from "react-router-dom";
import { apiGetArticles, apiGetTrending, apiGetCategories } from "../services/api";
import { Helmet } from "react-helmet-async";

/**
 * Previously this file included a timeAgo helper that was never used.
 * Keeping unused functions in modules triggers ESLint's `no-unused-vars`
 * rule and bloats the bundle unnecessarily. The implementation has been
 * removed to ensure the module only contains what it needs. If relative
 * time formatting is needed in the future, consider importing it from
 * a dedicated utility module instead of declaring it here.
 */

export default function HomePage() {
  const [data, setData] = useState({
    articles: [],
    trending: [],
    categories: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [articlesRes, trendingRes, categoriesRes] = await Promise.all([
          apiGetArticles(),
          apiGetTrending(),
          apiGetCategories()
        ]);
        
        setData({
          articles: articlesRes.data || [],
          trending: trendingRes.data || [],
          categories: categoriesRes.data || []
        });
      } catch (error) {
        console.error("Failed to fetch homepage data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const { articles, trending, categories } = data;
  const breaking = articles.find((a) => a.breaking); // API might not have this, fallback gracefully
  const featured = articles.filter((a) => a.featured);
  const latest = articles.slice(0, 10);
  const mainHeadline = featured.length > 0 ? featured[0] : latest[0];
  const sideHeadlines = featured.length > 1 ? featured.slice(1, 4) : latest.slice(1, 4);

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Beranda - HuluSungai News</title>
        <meta name="description" content="Portal berita terlengkap seputar Perkumpulan Hulu Sungai, Kalimantan Selatan." />
      </Helmet>
      {/* Breaking News Ticker */}
      {breaking && (
        <div className="bg-breaking text-white">
          <div className="max-w-7xl mx-auto px-4 flex items-center">
            <span className="flex items-center gap-2 px-3 py-1.5 bg-red-700 text-xs font-bold uppercase tracking-wider shrink-0">
              BREAKING
            </span>
            <div className="overflow-hidden flex-1 py-1.5">
              <Link to={`/article/${breaking.slug}`} className="block truncate text-sm font-medium hover:underline">
                {breaking.title} — {breaking.excerpt}
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Headline Section */}
        <section className="mb-8">
          <div className="news-divider-bold mb-4" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              {mainHeadline && <ArticleCard article={mainHeadline} variant="headline" />}
            </div>
            <div className="bg-white border border-surface-200 p-4">
              <h3 className="text-xs font-bold text-surface-500 uppercase tracking-wider mb-3">Berita Utama</h3>
              {sideHeadlines.map((a) => (
                <ArticleCard key={a.id} article={a} variant="side" />
              ))}
            </div>
          </div>
        </section>

        {/* Main content + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="news-divider-bold w-8" />
                <h2 className="text-lg font-bold text-surface-900">Berita Terkini</h2>
              </div>
              <Link to="/terkini" className="text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors">
                Selengkapnya →
              </Link>
            </div>
            <div className="bg-white border border-surface-200">
              <div className="divide-y divide-surface-200 px-4">
                {latest.map((a) => (
                  <ArticleCard key={a.id} article={a} variant="list" />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <div className="bg-white border border-surface-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-surface-200 bg-surface-50">
                <h3 className="text-sm font-bold text-surface-900 uppercase tracking-wider flex items-center gap-2">Terpopuler</h3>
              </div>
              <div className="divide-y divide-surface-200">
                {trending.map((a, i) => (
                  <Link key={a.id} to={`/article/${a.slug}`} className="flex items-start gap-3 px-4 py-3 group hover:bg-surface-50 transition-colors" id={`popular-${a.id}`}>
                    <span className={`text-xl font-black shrink-0 w-6 ${i === 0 ? "text-primary-700" : "text-surface-300"}`}>{i + 1}</span>
                    <div>
                      <h4 className="text-sm font-semibold text-surface-800 group-hover:text-primary-600 transition-colors line-clamp-2 leading-snug">{a.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-surface-400">{a.views} dibaca</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-white border border-surface-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-surface-200 bg-surface-50">
                <h3 className="text-sm font-bold text-surface-900 uppercase tracking-wider">Kategori</h3>
              </div>
              <div className="p-3 divide-y divide-surface-100">
                {categories.map((cat) => (
                  <Link key={cat.slug} to={`/kategori/${cat.slug}`}
                    className="flex items-center justify-between px-3 py-3 hover:bg-surface-50 transition-colors group">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color || '#3391ff' }} />
                      <span className="text-sm text-surface-700 group-hover:text-surface-900 font-medium">{cat.name}</span>
                    </div>
                    <span className="text-xs text-surface-400 bg-surface-100 px-2 py-0.5 rounded-full">{cat.article_count || 0}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-surface-50 border border-surface-200 border-t-4 border-t-primary-700 p-5">
              <h3 className="font-bold text-surface-900 mb-2">Hubungi Redaksi</h3>
              <p className="text-surface-600 text-sm mb-4">Punya informasi atau ingin mengirim artikel? Hubungi kami.</p>
              <a href="mailto:redaksi@hulusungai.news" className="block text-center py-2 bg-primary-700 text-white text-sm font-semibold hover:bg-primary-800 transition-colors">
                redaksi@hulusungai.news
              </a>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
