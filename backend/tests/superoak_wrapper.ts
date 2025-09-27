// tests/superoak_wrapper.ts
/**
 * Compatibility shim for Deno2.
 *
 * Deno2 removed the global `window` object, but `superdeno`
 * (used by `superoak`) still expects it.  By assigning
 * `globalThis` to `window` *inside this module* we guarantee
 * that the shim runs **before** `superoak` is imported.
 */

// This avoids the `any` lint rule while still letting us set it.
(globalThis as unknown as { window?: typeof globalThis }).window = globalThis;

// Re-export the original superoak symbols.
export { superoak } from "superoak";
