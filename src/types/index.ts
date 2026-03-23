export interface Article {
  id: string;
  title: string;
  content: string;
  url: string;
  source: string;
  category: string;
  published_at: string | null;
  fetched_at: string | null;
  ai_summary: string | null;
  ai_sentiment: 'positive' | 'negative' | 'neutral' | null;
  ai_tags: string[];
  is_bookmarked: boolean;
  read: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ArticleListResponse {
  articles: Article[];
  total: number;
  page: number;
  pages: number;
}

export interface Stats {
  total: number;
  bookmarked: number;
  read: number;
  by_category: Record<string, number>;
  by_sentiment: Record<string, number>;
  recent_searches: string[];
}

export type Category = 'world' | 'technology' | 'science' | 'business' | 'health' | 'sports' | '';
export type Sentiment = 'positive' | 'negative' | 'neutral' | '';
