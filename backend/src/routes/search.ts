import { Context } from "../deps.ts";
import { listSnippets } from "../../kv/kvSnippet.ts";
import { Snippet, SearchResult } from "../../../shared/types.ts";

// This file has the search endpoint description.
// Also, all search helper files is in the same file for simplicity.
// We use the router in snippet.ts to call the handler here.

// Handler for GET /search?query=...
export async function searchSnippets(ctx: Context) {
  const url = new URL(ctx.request.url);
  const query = url.searchParams.get("query") || "";
  if (!query) {
    ctx.response.status = 400;
    ctx.response.type = "application/json";
    ctx.response.body = { error: "missing `query` parameter" };
    return;
  }
  
  // security related validation
  if (ctx.request.hasBody) {
    ctx.response.status = 400;
    ctx.response.type = "application/json";
    ctx.response.body = { error: "GET /search does not accept a body" };
    return;
  }
  if ([...url.searchParams].length > 1) {
    ctx.response.status = 400;
    ctx.response.type = "application/json";
    ctx.response.body = { error: "GET /search only accepts `query` parameter" };
    return;
  }
  if (query.length > 80) {
    ctx.response.status = 400;
    ctx.response.type = "application/json";
    ctx.response.body = { error: "`query` parameter is too long (max 80 chars)" };
    return;
  }
  // sanitize for injection attacks
  if (!/^[a-zA-Z0-9 _-]+$/.test(query)) {
    ctx.response.status = 400;
    ctx.response.type = "application/json";
    ctx.response.body = { error: "`query` parameter contains invalid characters" };
    return;
  }

  // when all checks pass, we do the search
  // if no results, return empty array
  const snippets = await get_snippets();
  const results: SearchResult[] = create_search_result_set(query, snippets);
  ctx.response.status = 200;
  ctx.response.type = "application/json";
  ctx.response.body = results;
}

// Return true if pattern is found in text (case-insensitive)
export function matches(pattern: string, text: string): boolean {
  return text.toLowerCase().includes(pattern.toLowerCase());
}

// Return 0 or positive integers, depending on how many matches
export function matching_words(patterns: string[], text: string): number {
  return patterns.reduce((count, pattern) => count + (matches(pattern, text) ? 1 : 0), 0);
}

// Extract all snippets titles for searching
async function get_snippets(): Promise<Snippet[]> {
    const snippets: Snippet[] = [];
    for await (const snippet of await listSnippets()) {
        snippets.push(snippet);
    }
    return snippets;
}

// Calculate relevance score.
// 0 means snippet is not shown in results, more is better.
function calculate_relevance(search_string: string, snippet: Snippet): number {
    const words = search_string.split(" ");
    const score = matching_words(words, snippet.title);
    return score;
}

export function create_search_result_set(search_string: string, snippets: Snippet[]): SearchResult[] {
    const results: SearchResult[] = [];
    for (const snippet of snippets) {
        const score = calculate_relevance(search_string, snippet);
        if (score > 0) { results.push({ uuid: snippet.uuid, score }) };
    }
    // descending list
    return results.sort((b, a) => a.score - b.score);
}


