import { Context, Router } from "../deps.ts";

// Handler to serve Swagger UI static files and openapi.yaml
async function serveSwaggerUI(ctx: Context) {
  const path = ctx.request.url.pathname;
  if (path === "/docs/openapi.yaml") {
    // Serve the OpenAPI spec
    await ctx.send({
      root: Deno.cwd(),
      path: "openapi.yaml",
      contentTypes: { yaml: "application/yaml" },
    });
    return;
  }
  // Serve Swagger UI static files from ./swagger-ui directory
  const filePath = path.replace("/docs", "");
  await ctx.send({
    root: `${Deno.cwd()}/swagger-ui`,
    path: filePath === "" || filePath === "/" ? "/index.html" : filePath,
  });
}

const router = new Router();
router.get("/docs/openapi.yaml", serveSwaggerUI);
router.get("/docs/(.*)", serveSwaggerUI);
router.get("/docs", serveSwaggerUI);

export default router;
