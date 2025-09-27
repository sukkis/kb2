import { getKv } from "./kvClient.ts";
import { Snippet } from "../../shared/types.ts";

export async function saveSnippet(
  uuid: string,
  snippet: Snippet,
) {
  await getKv().set(["snippets", uuid], snippet);
}

export async function getSnippet(uuid: string): Promise<Snippet | null> {
  const entry = await getKv().get(["snippets", uuid]);
  return entry.value as Snippet | null;
}

export async function deleteSnippet(uuid: string) {
  await getKv().delete(["snippets", uuid]);
}

export async function listSnippets(): Promise<Snippet[]> {
  const snippets: Snippet[] = [];
  for await (const entry of getKv().list({ prefix: ["snippets"] })) {
    if (entry.value) {
      snippets.push(entry.value as Snippet);
    }
  }
  return snippets;
}

// timestamp is stored in Unix Epoch integer, convert to ISO when needed to display
export function isoTimestamp(ms: number): string {
  return new Date(ms).toISOString();
}
