import { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getStats, getTrending } from '../utils/api';
import type { Stats } from '../types';
import { TrendingUp, Loader } from 'lucide-react';

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#f59e0b', '#10b981', '#ef4444'];
const SENTIMENT_COLORS: Record<string, string> = {
  positive: '#10b981', negative: '#ef4444', neutral: '#94a3b8', unknown: '#475569'
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [trending, setTrending] = useState<{ tag: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStats(), getTrending()])
      .then(([s, t]) => { setStats(s); setTrending(t.trending); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <Loader size={32} className="animate-spin text-blue-500" />
    </div>
  );

  if (!stats) return null;

  const categoryData = Object.entries(stats.by_category).map(([k, v]) => ({ name: k, count: v }));
  const sentimentData = Object.entries(stats.by_sentiment).map(([k, v]) => ({ name: k, value: v }));

  return (
    <div className="h-full overflow-y-auto pb-16 md:pb-0 p-4">
      <h2 className="text-lg font-bold mb-4">Dashboard</h2>

      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'text-blue-400' },
          { label: 'Read', value: stats.read, color: 'text-green-400' },
          { label: 'Saved', value: stats.bookmarked, color: 'text-yellow-400' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card p-4">
          <h3 className="text-sm font-medium text-slate-400 mb-4">Articles by Category</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={categoryData}>
              <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-4">
          <h3 className="text-sm font-medium text-slate-400 mb-4">Sentiment Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={sentimentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {sentimentData.map((entry, i) => (
                  <Cell key={i} fill={SENTIMENT_COLORS[entry.name] || COLORS[i]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trending */}
      {trending.length > 0 && (
        <div className="card p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-blue-400" />
            <h3 className="text-sm font-medium">Trending Topics</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {trending.map(({ tag, count }) => (
              <span key={tag} className="badge bg-slate-800 text-slate-300 text-xs">
                #{tag} <span className="text-slate-500 ml-1">{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent searches */}
      {stats.recent_searches.length > 0 && (
        <div className="card p-4">
          <h3 className="text-sm font-medium text-slate-400 mb-3">Recent Searches</h3>
          <div className="flex flex-wrap gap-2">
            {stats.recent_searches.map(s => (
              <span key={s} className="badge bg-blue-900/30 text-blue-400">🔍 {s}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
