/**
 * Centralised test‑suite fixture.
 *
 * - Creates a temporary KV store (file‑backed) **once**.
 * - Builds the test-only Oak application using that KV.
 * - Exposes a `resetKv` helper that wipes the KV between tests.
 *
 * Import this module in any test file that needs the app/KV.
 */

import { createTestApp } from "../src/routes/testRouter.ts";
import type { Application } from "../src/deps.ts";

/** The temporary KV instance that will be shared by all tests. */
let kv: Deno.Kv;

/** The Oak Application that uses the shared KV. */
let app: Application;

/** Path to the temporary directory – needed for cleanup. */
let tmpDir: string;

/**
 * Clears **all** keys from the KV store.
 * Useful to run before each individual test so they start from a clean slate.
 */
export async function resetKv(): Promise<void> {
  // `kv.list({ prefix: [] })` iterates over *every* key.
  for await (const entry of kv.list({ prefix: [] })) {
    await kv.delete(entry.key);
  }
}

/**
 * Called by the test runner *once* before any test in the file runs.
 * It creates the KV, the app, and stores the temp‑dir path for later removal.
 */
export async function initSuite(): Promise<{ app: Application; kv: Deno.Kv }> {
  // Create a temporary folder (OS‑wide temp dir)
  tmpDir = await Deno.makeTempDir({ prefix: "kv_test_suite_" });

  // Open a KV backed by a SQLite file inside that folder.
  kv = await Deno.openKv(`${tmpDir}/kv.sqlite`);

  // Build the test‑only Oak app, injecting the KV.
  app = createTestApp(kv);

  // Return both so the test file can destructure if it wants.
  return { app, kv };
}

/**
 * Called after the whole suite finishes – closes the KV and removes the temp folder.
 */
export async function teardownSuite(): Promise<void> {
  // Close the KV handle (releases the file lock)
  kv.close();

  // Delete the temporary directory (removes the SQLite file)
  try {
    await Deno.remove(tmpDir, { recursive: true });
  } catch (_) {
    // ignore – the folder may already be gone
  }
}

// abstract away other things than just doing the test
// try to make test files minimal and have the complexity in scaffolding
// export function defineTestSuite(
//   name: string,
//   testSteps: (app: Application) => Promise<void>
// ): void {
//   Deno.test(name, async (t) => {
//     const suite = await initSuite();
//     const app = suite.app;

//     await t.step("reset KV before each test", async () => {
//       await resetKv();
//     });

//     await testSteps(app);

//     await t.step("teardown suite", async () => {
//       await teardownSuite();
//     });
//   });
// }

export function defineTestSuite(
  name: string,
  steps: (t: Deno.TestContext, app: Application) => Promise<void>,
): void {
  Deno.test(name, async (t) => {
    const suite = await initSuite();
    const app = suite.app;

    await t.step("reset KV before each test", async () => {
      await resetKv();
    });

    await steps(t, app);

    await t.step("teardown suite", async () => {
      await teardownSuite();
    });
  });
}

// Re-export common test utilities
export { assertEquals, assertObjectMatch } from "@std/asserts";
export { superoak } from "./superoak_wrapper.ts";
export type { Application } from "../src/deps.ts";
