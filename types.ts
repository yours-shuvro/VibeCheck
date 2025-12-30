
export interface Post {
  id: string;
  author: string;
  handle: string;
  content: string;
  timestamp: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface VibeData {
  score: number; // -1 to 1
  summary: string;
  posts: Post[];
  trend: 'up' | 'down' | 'stable';
}

export interface GeminiResponse {
  score: number;
  summary: string;
  posts: Array<{
    author: string;
    handle: string;
    content: string;
  }>;
}
