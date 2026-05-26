import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import DOMPurify from "dompurify";
import ArticleCard from "../components/ArticleCard";
import { apiGetArticleBySlug, apiCreateComment, apiGetArticles } from "../services/api";
import { Helmet } from "react-helmet-async";

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function ArticleDetailPage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [bookmarked, setBookmarked] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState({ name: "", text: "" });
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentMsg, setCommentMsg] = useState({ type: "", text: "" });

  const [moreNews, setMoreNews] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await apiGetArticleBySlug(slug);
        setArticle(res.data);
        
        // Fetch more news
        const moreRes = await apiGetArticles("?per_page=5");
        setMoreNews(moreRes.data.filter(a => a.id !== res.data.id));
      } catch (err) {
        setError("Artikel tidak ditemukan");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug, apiGetArticleBySlug, apiGetArticles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-surface-200 mb-3">404</h2>
          <p className="text-surface-500 mb-6">{error || "Artikel tidak ditemukan"}</p>
          <Link to="/" className="px-5 py-2.5 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors">Kembali ke Beranda</Link>
        </div>
      </div>
    );
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (newComment.name.trim() && newComment.text.trim()) {
      setSubmittingComment(true);
      setCommentMsg({ type: "", text: "" });
      try {
        await apiCreateComment(article.id, newComment.name, "", newComment.text);
        setComments(prev => [{ id: Date.now(), name: DOMPurify.sanitize(newComment.name), text: DOMPurify.sanitize(newComment.text), time: "Baru saja (Pending Approval)", likes: 0 }, ...prev]);
        setNewComment({ name: "", text: "" });
        setCommentMsg({ type: "success", text: "Komentar berhasil dikirim dan menunggu moderasi." });
      } catch (err) {
        setCommentMsg({ type: "error", text: "Gagal mengirim komentar: " + err.message });
      } finally {
        setSubmittingComment(false);
      }
    }
  };

  const shareUrl = encodeURIComponent(window.location.href);
  const shareText = encodeURIComponent(article.title);

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>{article.title} - KBB SADUNIA</title>
        <meta name="description" content={article.excerpt} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
        {article.image_url && <meta property="og:image" content={article.image_url} />}
        <meta property="og:type" content="article" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": article.title,
            "image": [article.image_url || ""],
            "datePublished": article.published_at,
            "author": [{
              "@type": "Person",
              "name": article.author_name || "Redaksi"
            }]
          })}
        </script>
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <nav className="flex items-center gap-1.5 text-xs text-surface-400 mb-4" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-primary-600 transition-colors">Beranda</Link>
          <span aria-hidden="true">›</span>
          <Link to={`/kategori/${article.category_slug}`} className="hover:text-primary-600 transition-colors">{article.category_name}</Link>
          <span aria-hidden="true">›</span>
          <span className="text-surface-500 line-clamp-1 max-w-[250px]">{article.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <article className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold text-white" style={{ backgroundColor: article.category_color || '#3391ff' }}>{article.category_name}</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-serif font-bold text-surface-900 leading-tight mb-3">{article.title}</h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-surface-500 mb-4 pb-4 border-b border-surface-200">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center text-white text-[10px] font-bold" aria-hidden="true">{(article.author_name || "A").charAt(0)}</div>
                <span className="font-medium text-surface-700">{article.author_name || "Redaksi"}</span>
              </div>
              <time dateTime={article.published_at}>{formatDate(article.published_at)}</time>
              <span>{article.read_time} baca</span>
              <span>{article.views} kali dibaca</span>
            </div>

            <div className="flex items-center justify-between mb-5 py-2">
              <div className="flex items-center gap-1" role="group" aria-label="Ukuran font">
                <span className="text-xs text-surface-400 mr-1">Ukuran:</span>
                <button onClick={() => setFontSize(f => Math.max(14, f - 2))} className="w-7 h-7 rounded bg-surface-100 hover:bg-surface-200 text-surface-600 text-xs font-bold transition-colors">A-</button>
                <button onClick={() => setFontSize(f => Math.min(22, f + 2))} className="w-7 h-7 rounded bg-surface-100 hover:bg-surface-200 text-surface-600 text-sm font-bold transition-colors">A+</button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setBookmarked(!bookmarked)} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${bookmarked ? "bg-accent-400 text-white border-accent-400" : "bg-white text-surface-600 border-surface-200 hover:border-primary-300"}`}>
                  {bookmarked ? "★ Tersimpan" : "☆ Simpan"}
                </button>
              </div>
            </div>

            {article.image_url && (
              <figure className="mb-6">
                <img src={article.image_url} alt={article.title} className="w-full h-[350px] object-cover rounded-lg" />
              </figure>
            )}

            <div className="prose-article animate-fade-in" style={{ fontSize: `${fontSize}px` }} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }} />

            <div className="mt-6 p-4 bg-surface-50 rounded-lg border border-surface-200">
              <p className="text-sm font-semibold text-surface-700 mb-3">Bagikan Artikel</p>
              <div className="flex flex-wrap gap-2">
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg bg-[#1877f2] text-white text-xs font-semibold hover:opacity-90 transition-opacity">Facebook</a>
                <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg bg-[#1da1f2] text-white text-xs font-semibold hover:opacity-90 transition-opacity">Twitter</a>
                <a href={`https://api.whatsapp.com/send?text=${shareText}%20${shareUrl}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg bg-[#25d366] text-white text-xs font-semibold hover:opacity-90 transition-opacity">WhatsApp</a>
              </div>
            </div>

            <section className="mt-8" id="comments">
              <h3 className="text-lg font-bold text-surface-900 mb-4">Komentar</h3>
              {commentMsg.text && (
                <div className={`mb-4 p-3 rounded-lg border text-sm ${commentMsg.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                  {commentMsg.text}
                </div>
              )}
              <form onSubmit={handleSubmitComment} className="bg-white rounded-lg border border-surface-200 p-4 mb-6">
                <input type="text" placeholder="Nama Anda" value={newComment.name} onChange={(e) => { setNewComment(p => ({...p, name: e.target.value})); setCommentMsg({type:"", text:""}); }}
                  className="w-full px-3 py-2 rounded-lg border border-surface-200 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400" required disabled={submittingComment} />
                <textarea placeholder="Tulis komentar..." value={newComment.text} onChange={(e) => { setNewComment(p => ({...p, text: e.target.value})); setCommentMsg({type:"", text:""}); }} rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-surface-200 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 resize-none" required disabled={submittingComment} />
                <button type="submit" disabled={submittingComment} className="px-5 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50">
                  {submittingComment ? "Mengirim..." : "Kirim Komentar"}
                </button>
              </form>
              <div className="space-y-4">
                {comments.map((c) => (
                  <div key={c.id} className="bg-white rounded-lg border border-surface-200 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-surface-200 flex items-center justify-center text-surface-600 text-xs font-bold">{c.name.charAt(0)}</div>
                        <div>
                          <span className="text-sm font-semibold text-surface-800">{c.name}</span>
                          <span className="text-xs text-surface-400 ml-2">{c.time}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-surface-600 leading-relaxed">{c.text}</p>
                  </div>
                ))}
              </div>
            </section>
          </article>

          <aside className="space-y-6">
            <div className="bg-white rounded-lg border border-surface-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-surface-200 bg-surface-50">
                <h3 className="text-sm font-bold text-surface-900 uppercase tracking-wider">Berita Lainnya</h3>
              </div>
              <div className="p-3">
                {moreNews.map((a) => (
                  <ArticleCard key={a.id} article={a} variant="side" />
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
