export const prodKv = await Deno.openKv();
export const kv = prodKv; // for backward compatibility

export function getKv(): Deno.Kv {
  // Use test KV if set by testRouter, else use production KV
  // deno-lint-ignore no-explicit-any
  return (globalThis as any).__TEST_KV__ ?? prodKv;
}
