/**
 * Test‑only router.
 *
 * • It **requires** a Deno.Kv instance – you must pass one when you
 *   create the app.  If you forget, we throw immediately so you never
 *   accidentally write to the real KV store.
 *
 * • It sets the KV instance on `globalThis.__TEST_KV__`.  The helper
 *   functions in `kv/kvSnippet.ts` look for that property and will
 *   use it instead of the production KV.
 *
 * • It defines a very small health‑check endpoint at `/health`.
 *   (You can add more test‑only routes here later.)
 */

import { Application, Router, Context } from "../deps.ts";
//import { Application, Router, Context } from "@oak/oak"; 


/**
 * Build an Oak `Application` that uses the supplied KV.
 *
 * @param kvInstance – a temporary, file‑backed KV created by the test.
 * @returns an `Application` ready to be handed to SuperOak.
 */
export function createTestApp(kvInstance: Deno.Kv): Application {
  if (!kvInstance) {
    throw new Error(
      "❗️ createTestApp: a Deno.Kv instance must be supplied for tests.",
    );
  }

  // Expose the test KV globally – the only place that does this.
  (globalThis as any).__TEST_KV__ = kvInstance;

  const router = new Router();

  router.get("/health", (ctx: Context) => {
    ctx.response.type = "application/json";
    ctx.response.body = {
    status: "ok",
    timestamp: new Date().toISOString(),
    };
  });

  // -----------------------------------------------------------------
  // (Optional) you could mount the real snippet routes here if you
  // want to test them together with the health endpoint:
  //   import snippetRouter from "./snippet.ts";
  //   router.use(snippetRouter.routes());
  //   router.use(snippetRouter.allowedMethods());
  // -----------------------------------------------------------------

  const app = new Application();
  app.use(router.routes());
  app.use(router.allowedMethods());

  return app;
}
