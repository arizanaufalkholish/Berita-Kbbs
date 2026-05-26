import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiGetArticles, apiGetCategories } from "../services/api";
import ArticleCard from "../components/ArticleCard";
import { Helmet } from "react-helmet-async";

export default function CategoryPage() {
  const { slug } = useParams();
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [articlesRes, categoriesRes] = await Promise.all([
          apiGetArticles(`?category=${slug}`),
          apiGetCategories()
        ]);
        setArticles(articlesRes.data || []);
        setCategories(categoriesRes.data || []);
      } catch (error) {
        console.error("Failed to fetch category data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  const category = categories.find((c) => c.slug === slug);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-surface-200 mb-3">404</h2>
          <p className="text-surface-500 mb-6">Kategori tidak ditemukan</p>
          <Link to="/" className="px-5 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors">Kembali ke Beranda</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>{category.name} - HuluSungai News</title>
        <meta name="description" content={`Berita terbaru dan terpopuler seputar ${category.name}`} />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="h-1 w-16 rounded mb-3" style={{ backgroundColor: category.color || '#3391ff' }} />
          <h1 className="text-2xl font-bold text-surface-900 mb-1">{category.name}</h1>
          <p className="text-surface-500 text-sm">{articles.length} artikel dalam kategori ini</p>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {categories.map((cat) => (
            <Link key={cat.slug} to={`/kategori/${cat.slug}`}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-all ${cat.slug === slug ? "text-white border-transparent" : "bg-white text-surface-600 border-surface-200 hover:border-surface-300"}`}
              style={cat.slug === slug ? { backgroundColor: cat.color || '#3391ff' } : {}}>
              {cat.name}
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {articles.length > 0 ? (
              <>
                {/* First article as headline */}
                <ArticleCard article={articles[0]} variant="headline" />
                {/* Rest as list */}
                {articles.length > 1 && (
                  <div className="bg-white rounded-lg border border-surface-200 mt-4">
                    <div className="divide-y divide-surface-100 px-4">
                      {articles.slice(1).map((a) => (
                        <ArticleCard key={a.id} article={a} variant="list" />
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 text-surface-400">Belum ada artikel dalam kategori ini.</div>
            )}
          </div>
          <aside>
            <div className="bg-white rounded-lg border border-surface-200 overflow-hidden sticky top-28">
              <div className="px-4 py-3 border-b border-surface-200 bg-surface-50">
                <h3 className="text-sm font-bold text-surface-900 uppercase tracking-wider">Kategori Lainnya</h3>
              </div>
              <div className="p-3">
                {categories.filter((c) => c.slug !== slug).map((cat) => (
                  <Link key={cat.slug} to={`/kategori/${cat.slug}`} className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-surface-50 transition-colors group">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color || '#3391ff' }} />
                      <span className="text-sm text-surface-700 group-hover:text-surface-900 font-medium">{cat.name}</span>
                    </div>
                    <span className="text-xs text-surface-400">{cat.article_count || 0}</span>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
