import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, Bot, User, Loader, Trash2 } from 'lucide-react';
import { chat, getArticle } from '../utils/api';
import type { Article, ChatMessage } from '../types';
import ReactMarkdown from 'react-markdown';

let msgCounter = 0;
const newId = () => String(++msgCounter);

export default function ChatPage() {
  const [searchParams] = useSearchParams();
  const articleId = searchParams.get('article') || undefined;
  const [article, setArticle] = useState<Article | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: newId(), role: 'assistant',
    content: 'Hello! I\'m your AI news assistant. Ask me anything about current events, request article summaries, or get context on complex topics.',
    timestamp: new Date()
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (articleId) {
      getArticle(articleId).then(setArticle);
      setMessages(prev => [...prev, {
        id: newId(), role: 'assistant',
        content: `I've loaded the article context. Ask me anything about it!`,
        timestamp: new Date()
      }]);
    }
  }, [articleId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = { id: newId(), role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
    try {
      const res = await chat(input, history, articleId);
      setMessages(prev => [...prev, {
        id: newId(), role: 'assistant', content: res.response, timestamp: new Date()
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: newId(), role: 'assistant',
        content: '⚠️ Connection error. Make sure the backend and Ollama are running.',
        timestamp: new Date()
      }]);
    }
    setLoading(false);
  };

  const clearChat = () => {
    setMessages([{
      id: newId(), role: 'assistant',
      content: 'Chat cleared. How can I help you?',
      timestamp: new Date()
    }]);
  };

  const SUGGESTIONS = [
    'Summarize today\'s top news',
    'What are the major world events?',
    'Explain the latest tech news',
    'What\'s trending in science?'
  ];

  return (
    <div className="h-full flex flex-col pb-16 md:pb-0" style={{ height: 'calc(100vh - 65px)' }}>
      {/* Header */}
      <div className="border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot size={20} className="text-blue-400" />
          <span className="font-medium">AI News Assistant</span>
          {article && <span className="text-xs text-slate-500 hidden sm:block">· {article.title.slice(0, 40)}...</span>}
        </div>
        <button onClick={clearChat} className="btn-ghost flex items-center gap-1">
          <Trash2 size={14} /> Clear
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-blue-600' : 'bg-slate-700'
            }`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-200'
            }`}>
              {msg.role === 'assistant' ? (
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div className="bg-slate-800 rounded-xl px-4 py-3 flex items-center gap-2">
              <Loader size={14} className="animate-spin text-blue-400" />
              <span className="text-sm text-slate-400">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => { setInput(s); }}
              className="shrink-0 text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 px-3 py-1.5 rounded-lg transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-slate-800 p-4">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask about news, request analysis..."
            className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 px-4 py-3 rounded-xl transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
