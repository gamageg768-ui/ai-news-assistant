import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Newspaper, BookmarkCheck, BarChart3, MessageCircle, Search, RefreshCw, Menu, X, Wifi, WifiOff } from 'lucide-react';
import NewsFeed from './pages/NewsFeed';
import ArticleView from './pages/ArticleView';
import Bookmarks from './pages/Bookmarks';
import Dashboard from './pages/Dashboard';
import ChatPage from './pages/ChatPage';
import { getHealth, fetchNews } from './utils/api';
import './index.css';

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [ollamaOk, setOllamaOk] = useState<boolean | null>(null);
  const [fetching, setFetching] = useState(false);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    getHealth().then(d => setOllamaOk(d.ollama)).catch(() => setOllamaOk(false));
  }, []);

  const handleFetch = async () => {
    setFetching(true);
    try {
      const res = await fetchNews();
      alert(`✅ ${res.message}`);
    } catch {
      alert('❌ Failed to fetch news. Check backend.');
    }
    setFetching(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    navigate('/');
  };

  const navItems = [
    { path: '/', icon: <Newspaper size={20} />, label: 'News' },
    { path: '/bookmarks', icon: <BookmarkCheck size={20} />, label: 'Saved' },
    { path: '/chat', icon: <MessageCircle size={20} />, label: 'AI Chat' },
    { path: '/dashboard', icon: <BarChart3 size={20} />, label: 'Stats' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <button className="md:hidden p-1" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Newspaper size={16} />
            </div>
            <span className="font-bold text-lg hidden sm:block">NewsAI</span>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search news..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-2">
            {ollamaOk !== null && (
              <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${ollamaOk ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                {ollamaOk ? <Wifi size={12} /> : <WifiOff size={12} />}
                <span className="hidden sm:inline">{ollamaOk ? 'AI Online' : 'AI Offline'}</span>
              </div>
            )}
            <button
              onClick={handleFetch}
              disabled={fetching}
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              <RefreshCw size={14} className={fetching ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">{fetching ? 'Fetching...' : 'Fetch News'}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-7xl mx-auto w-full">
        {/* Sidebar nav */}
        <nav className={`${menuOpen ? 'flex' : 'hidden'} md:flex flex-col gap-1 p-4 w-52 border-r border-slate-800 shrink-0`}>
          {navItems.map(item => (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); setMenuOpen(false); }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive(item.path) ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Main content */}
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<NewsFeed searchQuery={search} />} />
            <Route path="/article/:id" element={<ArticleView />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 flex">
        {navItems.map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-colors ${
              isActive(item.path) ? 'text-blue-400' : 'text-slate-500'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
