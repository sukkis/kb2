// how snippets are stored in Deno KV
export interface Snippet {
  uuid: string;
  title: string;
  content: string;
  timestamp: number;
}

// how snippet creation requests are sent from frontend to backend
export interface SnippetRequest {
  title: string;
  content: string;
}

// search result with relevance score
// 0 means no match, higher is better
export interface SearchResult {
  uuid: string;
  score: number;
}
