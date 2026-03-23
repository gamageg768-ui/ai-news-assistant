import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bookmark, BookmarkCheck, ExternalLink, Tag, MessageCircle, RefreshCw, Loader } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getArticle, toggleBookmark, reAnalyze } from '../utils/api';
import type { Article } from '../types';

export default function ArticleView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (!id) return;
    getArticle(id).then(setArticle).finally(() => setLoading(false));
  }, [id]);

  const handleBookmark = async () => {
    if (!article) return;
    const res = await toggleBookmark(article.id);
    setArticle(prev => prev ? { ...prev, is_bookmarked: res.bookmarked } : prev);
  };

  const handleReAnalyze = async () => {
    if (!article) return;
    setAnalyzing(true);
    const updated = await reAnalyze(article.id);
    setArticle(updated);
    setAnalyzing(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader size={32} className="animate-spin text-blue-500" />
    </div>
  );

  if (!article) return (
    <div className="p-8 text-center text-slate-500">Article not found</div>
  );

  return (
    <div className="h-full overflow-y-auto pb-16 md:pb-0">
      <div className="sticky top-0 bg-slate-950 border-b border-slate-800 px-4 py-3 flex items-center gap-3 z-10">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-800 rounded-lg">
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 text-sm text-slate-400 truncate">{article.source}</div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleReAnalyze}
            disabled={analyzing}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-400"
            title="Re-analyze with AI"
          >
            <RefreshCw size={16} className={analyzing ? 'animate-spin' : ''} />
          </button>
          <button onClick={handleBookmark} className="p-2 hover:bg-slate-800 rounded-lg">
            {article.is_bookmarked ? <BookmarkCheck size={18} className="text-yellow-400" /> : <Bookmark size={18} className="text-slate-400" />}
          </button>
          <a href={article.url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-400">
            <ExternalLink size={18} />
          </a>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6">
        {/* Category & Sentiment */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="badge bg-blue-900/40 text-blue-400">{article.category}</span>
          {article.ai_sentiment && (
            <span className={`badge ${
              article.ai_sentiment === 'positive' ? 'bg-green-900/40 text-green-400' :
              article.ai_sentiment === 'negative' ? 'bg-red-900/40 text-red-400' :
              'bg-slate-800 text-slate-400'
            }`}>
              {article.ai_sentiment}
            </span>
          )}
          <span className="text-xs text-slate-500">
            {article.published_at ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true }) : ''} · {article.source}
          </span>
        </div>

        <h1 className="text-2xl font-bold text-slate-100 leading-tight mb-6">{article.title}</h1>

        {/* AI Summary */}
        {article.ai_summary && (
          <div className="card p-4 mb-6 border-l-4 border-blue-500">
            <div className="flex items-center gap-2 mb-2 text-blue-400 text-sm font-medium">
              <span>🤖 AI Summary</span>
              {analyzing && <Loader size={12} className="animate-spin" />}
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">{article.ai_summary}</p>
          </div>
        )}

        {/* Tags */}
        {article.ai_tags.length > 0 && (
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <Tag size={14} className="text-slate-500" />
            {article.ai_tags.map(tag => (
              <span key={tag} className="badge bg-slate-800 text-slate-400">#{tag}</span>
            ))}
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed [&>p]:mb-4 [&>*]:text-slate-300"
          dangerouslySetInnerHTML={{ __html: article.content || '<p>No content available. Visit the original article.</p>' }}
        />

        {/* Chat CTA */}
        <div className="mt-8 card p-4 flex items-center gap-3">
          <MessageCircle size={20} className="text-blue-400" />
          <div className="flex-1">
            <p className="text-sm font-medium">Ask AI about this article</p>
            <p className="text-xs text-slate-500">Get context, fact-checks, or explanations</p>
          </div>
          <button
            onClick={() => navigate(`/chat?article=${article.id}`)}
            className="btn-primary"
          >
            Chat
          </button>
        </div>
      </div>
    </div>
  );
}
