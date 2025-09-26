import { kv } from "./kvClient.ts";

// add single snippet to KV
export async function saveSnippet(
  uuid: string,
  snippet: Record<string, unknown>,
) {
  await kv.set(["snippets", uuid], snippet);
}

// get single snippet from KV
export async function getSnippet(uuid: string) {
  const entry = await kv.get(["snippets", uuid]);
  return entry.value;
}

// timestamp is stored in Unix Epoch integer, convert to ISO when needed to display
export function isoTimestamp(ms: number): string {
  return new Date(ms).toISOString();
}
