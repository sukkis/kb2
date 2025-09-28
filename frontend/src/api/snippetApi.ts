import { Snippet } from "../shared/types";

export async function fetchSnippets(): Promise<Snippet[]> {
  const res = await fetch("http://localhost:8087/snippets");
  if (!res.ok) throw new Error("Failed to fetch snippets");
  return await res.json();
}

// check /health from backend
export async function checkHealth(): Promise<{ status: string }> {
  const res = await fetch("http://localhost:8087/health");
  if (!res.ok) throw new Error("Backend is not healthy");
  return await res.json();
}

// fetch a single snippet by id
export async function fetchSnippetById(id: string): Promise<Snippet> {
  const res = await fetch(`http://localhost:8087/snippets/${id}`);
  if (!res.ok) throw new Error("Failed to fetch snippet");
  return await res.json();
}

// create a new snippet
export async function createSnippet(
  snippet: Omit<Snippet, "id" | "createdAt" | "updatedAt">,
): Promise<Snippet> {
  const res = await fetch("http://localhost:8087/snippets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(snippet),
  });
  if (!res.ok) throw new Error("Failed to create snippet");
  return await res.json();
}
