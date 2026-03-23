import { useState, useEffect, useCallback } from 'react';
import { Filter } from 'lucide-react';
import { getArticles } from '../utils/api';
import type { Article, Category, Sentiment } from '../types';
import ArticleCard from '../components/ArticleCard';

const CATEGORIES: { value: Category; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'world', label: 'World' },
  { value: 'technology', label: 'Tech' },
  { value: 'science', label: 'Science' },
  { value: 'business', label: 'Business' },
  { value: 'health', label: 'Health' },
  { value: 'sports', label: 'Sports' },
];

const SENTIMENTS: { value: Sentiment; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'positive', label: '😊 Positive' },
  { value: 'neutral', label: '😐 Neutral' },
  { value: 'negative', label: '😟 Negative' },
];

interface Props { searchQuery?: string; }

export default function NewsFeed({ searchQuery = '' }: Props) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<Category>('');
  const [sentiment, setSentiment] = useState<Sentiment>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getArticles({ category, sentiment, search: searchQuery, page, per_page: 20 });
      setArticles(data.articles);
      setTotalPages(data.pages);
      setTotal(data.total);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [category, sentiment, searchQuery, page]);

  useEffect(() => { setPage(1); }, [category, sentiment, searchQuery]);
  useEffect(() => { load(); }, [load]);

  const handleBookmarkToggle = (id: string, bookmarked: boolean) => {
    setArticles(prev => prev.map(a => a.id === id ? { ...a, is_bookmarked: bookmarked } : a));
  };

  return (
    <div className="h-full overflow-y-auto pb-16 md:pb-0">
      <div className="p-4 border-b border-slate-800 sticky top-0 bg-slate-950 z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-slate-400">{total} articles</span>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg transition-colors ${showFilters ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            <Filter size={14} /> Filters
          </button>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`shrink-0 px-3 py-1 rounded-full text-sm transition-colors ${category === c.value ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {showFilters && (
          <div className="mt-3 flex gap-2 flex-wrap">
            <div className="flex items-center gap-1 text-sm text-slate-400">Sentiment:</div>
            {SENTIMENTS.map(s => (
              <button
                key={s.value}
                onClick={() => setSentiment(s.value)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${sentiment === s.value ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="h-4 bg-slate-800 rounded mb-2 w-1/3" />
                <div className="h-5 bg-slate-800 rounded mb-2" />
                <div className="h-4 bg-slate-800 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <p className="text-lg mb-2">No articles found</p>
            <p className="text-sm">Click "Fetch News" to load articles</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {articles.map(a => (
                <ArticleCard key={a.id} article={a} onBookmarkToggle={handleBookmarkToggle} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-6">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-ghost disabled:opacity-30">← Prev</button>
                <span className="text-sm text-slate-400">Page {page} of {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="btn-ghost disabled:opacity-30">Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
