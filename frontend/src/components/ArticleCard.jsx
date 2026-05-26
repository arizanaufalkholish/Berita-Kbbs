import { Link } from "react-router-dom";
import { timeAgo } from "../utils/date";

export default function ArticleCard({ article, variant = "default" }) {
  // Headline - big card like CNN top story
  if (variant === "headline") {
    return (
      <Link to={`/article/${article.slug}`} id={`headline-${article.id}`} className="group block relative overflow-hidden h-[420px]" aria-label={`Baca: ${article.title}`}>
        <img src={article.image_url} alt={article.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        {article.breaking && (
          <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 bg-breaking text-white text-xs font-bold uppercase tracking-wide" role="status">
            BREAKING
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <span className="inline-block px-2.5 py-0.5 text-[11px] font-bold text-white mb-2.5" style={{ backgroundColor: article.category_color || '#1e40af' }}>{article.category_name || 'Umum'}</span>
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2 leading-tight group-hover:text-primary-300 transition-colors">{article.title}</h2>
          <p className="text-surface-300 text-sm line-clamp-2 mb-3 max-w-lg">{article.excerpt}</p>
          <div className="flex items-center gap-3 text-xs text-surface-400">
            <span className="font-medium text-surface-300">{article.author_name || 'Admin'}</span>
            <span aria-hidden="true">•</span>
            <time dateTime={article.published_at}>{timeAgo(article.published_at)}</time>
          </div>
        </div>
      </Link>
    );
  }

  // Side headline - smaller version
  if (variant === "side") {
    return (
      <Link to={`/article/${article.slug}`} id={`side-${article.id}`} className="group flex gap-3 py-3 border-b border-surface-200 last:border-0" aria-label={`Baca: ${article.title}`}>
        <img src={article.image_url} alt={article.title} className="w-24 h-16 object-cover shrink-0 group-hover:opacity-90 transition-opacity" />
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-surface-900 group-hover:text-primary-600 transition-colors line-clamp-2 leading-snug">{article.title}</h3>
          <time className="text-xs text-surface-400 mt-1 block" dateTime={article.published_at}>{timeAgo(article.published_at)}</time>
        </div>
      </Link>
    );
  }

  // List item - like detik.com terkini
  if (variant === "list") {
    return (
      <Link to={`/article/${article.slug}`} id={`list-${article.id}`} className="group flex gap-4 py-4 border-b border-surface-200" aria-label={`Baca: ${article.title}`}>
        <img src={article.image_url} alt={article.title} className="w-40 h-24 object-cover shrink-0 group-hover:opacity-90 transition-opacity" />
        <div className="min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold px-2 py-0.5" style={{ backgroundColor: (article.category_color || '#1e40af') + "20", color: article.category_color || '#1e40af' }}>{article.category_name || 'Umum'}</span>
            <time className="text-xs text-surface-400" dateTime={article.published_at}>{timeAgo(article.published_at)}</time>
          </div>
          <h3 className="text-base font-bold text-surface-900 group-hover:text-primary-600 transition-colors line-clamp-2 leading-snug">{article.title}</h3>
          <p className="text-sm text-surface-500 line-clamp-1 mt-1">{article.excerpt}</p>
        </div>
      </Link>
    );
  }

  // Default card
  return (
    <Link to={`/article/${article.slug}`} id={`card-${article.id}`} className="group block bg-white border border-surface-200 hover:border-surface-300 transition-colors" aria-label={`Baca: ${article.title}`}>
      <div className="relative h-44 overflow-hidden">
        <img src={article.image_url} alt={article.title} className="w-full h-full object-cover group-hover:opacity-95 transition-opacity" />
        {article.breaking && (
          <div className="absolute top-0 left-0 px-2 py-1 bg-breaking text-white text-[10px] font-bold uppercase" role="status">
            BREAKING
          </div>
        )}
        <span className="absolute bottom-0 left-0 text-[11px] font-bold px-2 py-1 text-white" style={{ backgroundColor: article.category_color || '#1e40af' }}>{article.category_name || 'Umum'}</span>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-surface-900 group-hover:text-primary-600 transition-colors line-clamp-2 leading-snug mb-2">{article.title}</h3>
        <p className="text-sm text-surface-500 line-clamp-2 mb-3">{article.excerpt}</p>
        <div className="flex items-center justify-between text-xs text-surface-400">
          <span className="font-medium">{article.author_name || 'Admin'}</span>
          <time dateTime={article.published_at}>{timeAgo(article.published_at)}</time>
        </div>
      </div>
    </Link>
  );
}
