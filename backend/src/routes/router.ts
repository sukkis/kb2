/**
 * Production router – the only place that knows about the real
 * application routes.  It never touches any test‑only code.
 *
 * The router is exported as a *function* so that the caller can
 * instantiate a fresh `Application` whenever it wants (e.g. in
 * `main.ts` or in future integration tests that need the real KV).
 */

import { Router } from "../deps.ts"; // Oak router
import snippetRouter from "./snippet.ts"; // <-- your existing snippet routes
import swaggerUIRouter from "./swagger_ui.ts"; // Swagger UI docs router

// ---------------------------------------------------------------------
// Helper: builds a router that mounts all feature routers.
// ---------------------------------------------------------------------
export function createProdRouter(): Router {
  const router = new Router();

  // Health check / root endpoint – keeps the server alive and
  // gives a quick “everything is up” response.
  router.get("/health", (ctx) => {
    ctx.response.body = {
      status: "ok",
      timestamp: new Date().toISOString(),
    };
  });
  // Mount the snippet router under its own base path.
  // If you ever want a prefix (e.g. "/api"), just change the
  // second argument: `router.use("/api", snippetRouter.routes())`.

  router.use(snippetRouter.routes());
  router.use(snippetRouter.allowedMethods());

  // Mount Swagger UI and OpenAPI spec endpoints
  router.use(swaggerUIRouter.routes());
  router.use(swaggerUIRouter.allowedMethods());

  return router;
}
