import { useState, useEffect } from 'react';
import { BookmarkCheck, Loader } from 'lucide-react';
import { getArticles, generateBriefing } from '../utils/api';
import type { Article } from '../types';
import ArticleCard from '../components/ArticleCard';

export default function Bookmarks() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [briefing, setBriefing] = useState('');
  const [generatingBriefing, setGeneratingBriefing] = useState(false);

  useEffect(() => {
    getArticles({ bookmarked: true, per_page: 50 })
      .then(d => setArticles(d.articles))
      .finally(() => setLoading(false));
  }, []);

  const handleBookmarkToggle = (id: string, bookmarked: boolean) => {
    if (!bookmarked) setArticles(prev => prev.filter(a => a.id !== id));
  };

  const handleGenerateBriefing = async () => {
    if (articles.length === 0) return;
    setGeneratingBriefing(true);
    const res = await generateBriefing(articles.slice(0, 10).map(a => a.id));
    setBriefing(res.briefing);
    setGeneratingBriefing(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader size={32} className="animate-spin text-blue-500" />
    </div>
  );

  return (
    <div className="h-full overflow-y-auto pb-16 md:pb-0">
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookmarkCheck size={20} className="text-yellow-400" />
            <h2 className="font-semibold">Saved Articles</h2>
            <span className="badge bg-slate-800 text-slate-400">{articles.length}</span>
          </div>
          {articles.length > 0 && (
            <button
              onClick={handleGenerateBriefing}
              disabled={generatingBriefing}
              className="btn-primary flex items-center gap-2"
            >
              {generatingBriefing ? <Loader size={14} className="animate-spin" /> : '🤖'}
              AI Briefing
            </button>
          )}
        </div>
      </div>

      {briefing && (
        <div className="m-4 card p-4 border-l-4 border-blue-500">
          <h3 className="font-medium text-blue-400 mb-2">Your AI Briefing</h3>
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{briefing}</p>
        </div>
      )}

      <div className="p-4">
        {articles.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <BookmarkCheck size={40} className="mx-auto mb-3 opacity-30" />
            <p>No saved articles yet</p>
            <p className="text-sm mt-1">Bookmark articles to save them here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map(a => (
              <ArticleCard key={a.id} article={a} onBookmarkToggle={handleBookmarkToggle} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
