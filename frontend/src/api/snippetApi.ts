import { Snippet, SnippetRequest } from "../shared/types";

// fetch all snippets GET /snippets
export async function fetchSnippets(): Promise<Snippet[]> {
  const res = await fetch("http://localhost:8087/snippets");
  if (!res.ok) throw new Error("Failed to fetch snippets");
  return await res.json();
}

// check server responds, GET /health
export async function checkHealth(): Promise<{ status: string }> {
  const res = await fetch("http://localhost:8087/health");
  if (!res.ok) throw new Error("Backend is not healthy");
  return await res.json();
}

// fetch a single snippet by id, GET /snippets/:id
export async function fetchSnippetById(id: string): Promise<Snippet> {
  const res = await fetch(`http://localhost:8087/snippet/${id}`);
  if (!res.ok) throw new Error("Failed to fetch snippet");
  return await res.json();
}

// create a new snippet, POST /add
export async function createSnippet(
  title: string,
  content: string,
): Promise<Snippet> {
  const snippet: SnippetRequest = { title, content };
  const res = await fetch(`http://localhost:8087/add`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(snippet),
  });
  if (!res.ok) throw new Error(`Failed to create snippet: ${res.statusText}`);
  return await res.json();
}

// delete a snippet by id, DELETE /delete/:id
export async function deleteSnippet(id: string): Promise<void> {
  const res = await fetch(`http://localhost:8087/delete/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete snippet");
}

// search snippets by title, GET /search?query=...
export async function searchSnippets(
  query: string,
): Promise<{ uuid: string; score: number }[]> {
  const res = await fetch(
    `http://localhost:8087/search?query=${encodeURIComponent(query)}`,
  );
  if (!res.ok) throw new Error("Failed to search snippets");
  return await res.json();
}
