import axios from 'axios';
import type { Article, ArticleListResponse, Stats } from '../types';

const api = axios.create({ baseURL: (import.meta.env.VITE_API_URL || '') + '/api' });

export const fetchNews = (categories?: string[]) =>
  api.post('/fetch-news', { categories }).then(r => r.data);

export const getArticles = (params: {
  category?: string; sentiment?: string; search?: string;
  bookmarked?: boolean; page?: number; per_page?: number;
}) => api.get<ArticleListResponse>('/articles', {
  params: { ...params, bookmarked: params.bookmarked ? 'true' : undefined }
}).then(r => r.data);

export const getArticle = (id: string) =>
  api.get<Article>(`/articles/${id}`).then(r => r.data);

export const toggleBookmark = (id: string) =>
  api.post<{ bookmarked: boolean }>(`/articles/${id}/bookmark`).then(r => r.data);

export const reAnalyze = (id: string) =>
  api.post<Article>(`/articles/${id}/analyze`).then(r => r.data);

export const chat = (message: string, history: { role: string; content: string }[], article_id?: string) =>
  api.post<{ response: string }>('/chat', { message, history, article_id }).then(r => r.data);

export const getStats = () =>
  api.get<Stats>('/stats').then(r => r.data);

export const getTrending = () =>
  api.get<{ trending: { tag: string; count: number }[] }>('/trending').then(r => r.data);

export const generateBriefing = (article_ids: string[]) =>
  api.post<{ briefing: string }>('/summarize', { article_ids }).then(r => r.data);

export const getHealth = () =>
  api.get<{ status: string; ollama: boolean; models: string[] }>('/health').then(r => r.data);
