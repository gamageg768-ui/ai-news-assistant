import { useNavigate } from 'react-router-dom';
import { Bookmark, BookmarkCheck, ExternalLink, Tag, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { Article } from '../types';
import { toggleBookmark } from '../utils/api';

interface Props {
  article: Article;
  onBookmarkToggle?: (id: string, bookmarked: boolean) => void;
}

const SENTIMENT_STYLES: Record<string, string> = {
  positive: 'sentiment-positive',
  negative: 'sentiment-negative',
  neutral: 'sentiment-neutral',
};

const CATEGORY_COLORS: Record<string, string> = {
  world: 'bg-purple-900/40 text-purple-400',
  technology: 'bg-blue-900/40 text-blue-400',
  science: 'bg-cyan-900/40 text-cyan-400',
  business: 'bg-yellow-900/40 text-yellow-400',
  health: 'bg-green-900/40 text-green-400',
  sports: 'bg-orange-900/40 text-orange-400',
};

export default function ArticleCard({ article, onBookmarkToggle }: Props) {
  const navigate = useNavigate();

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const res = await toggleBookmark(article.id);
    onBookmarkToggle?.(article.id, res.bookmarked);
  };

  return (
    <div
      onClick={() => navigate(`/article/${article.id}`)}
      className={`card p-4 cursor-pointer hover:border-slate-700 transition-all hover:shadow-lg hover:shadow-blue-900/10 ${article.read ? 'opacity-70' : ''}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`badge ${CATEGORY_COLORS[article.category] || 'bg-slate-800 text-slate-400'}`}>
            {article.category}
          </span>
          {article.ai_sentiment && (
            <span className={SENTIMENT_STYLES[article.ai_sentiment] || 'badge bg-slate-800 text-slate-400'}>
              {article.ai_sentiment}
            </span>
          )}
          {article.read && <span className="badge bg-slate-800/50 text-slate-500">read</span>}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handleBookmark}
            className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-yellow-400"
          >
            {article.is_bookmarked ? <BookmarkCheck size={16} className="text-yellow-400" /> : <Bookmark size={16} />}
          </button>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-blue-400"
          >
            <ExternalLink size={16} />
          </a>
        </div>
      </div>

      <h3 className="font-semibold text-slate-100 mb-2 leading-snug line-clamp-2">{article.title}</h3>

      {article.ai_summary ? (
        <p className="text-slate-400 text-sm line-clamp-2 mb-3">{article.ai_summary}</p>
      ) : article.content ? (
        <p className="text-slate-500 text-sm line-clamp-2 mb-3" dangerouslySetInnerHTML={{ __html: article.content.slice(0, 200) }} />
      ) : null}

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <Clock size={12} />
          {article.published_at ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true }) : 'unknown'}
          <span className="mx-1">·</span>
          <span>{article.source}</span>
        </div>
        {article.ai_tags.length > 0 && (
          <div className="flex items-center gap-1">
            <Tag size={12} className="text-slate-600" />
            <div className="flex gap-1">
              {article.ai_tags.slice(0, 2).map(tag => (
                <span key={tag} className="text-xs text-slate-500">{tag}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
