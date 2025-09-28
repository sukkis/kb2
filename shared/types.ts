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
