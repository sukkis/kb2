import { getKv } from "./kvClient.ts";
export interface Snippet {
  uuid: string;
  title: string;
  content: string;
  timestamp: number;
}

export async function saveSnippet(
  uuid: string,
  snippet: Record<string, unknown>,
) {
  await getKv().set(["snippets", uuid], snippet);
}

export async function getSnippet(uuid: string) {
  const entry = await getKv().get(["snippets", uuid]);
  return entry.value;
}

export async function deleteSnippet(uuid: string) {
  await getKv().delete(["snippets", uuid]);
}

export async function listSnippets(): Promise<Array<Record<string, unknown>>> {
  const snippets: Array<Record<string, unknown>> = [];
  for await (const entry of getKv().list({ prefix: ["snippets"] })) {
    if (entry.value) {
      snippets.push(entry.value as Record<string, unknown>);
    }
  }
  return snippets;
}

// timestamp is stored in Unix Epoch integer, convert to ISO when needed to display
export function isoTimestamp(ms: number): string {
  return new Date(ms).toISOString();
}
