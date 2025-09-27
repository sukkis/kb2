import { Snippet } from '../shared/types';

// @ts-ignore
export async function fetchSnippets(): Promise<Snippet[]> {
  const res = await fetch('http://localhost:8087/snippets');
  if (!res.ok) throw new Error('Failed to fetch snippets');
  return await res.json();
}