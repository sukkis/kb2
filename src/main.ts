import { Application, send } from "../src/deps.ts";
import snippetRouter from "./routes/snippet.ts";

// Open Deno KV storage
import "./../kv/kvClient.ts";

const app = new Application();

// logging
app.use(async (ctx, next) => {
  console.log(`${ctx.request.method} ${ctx.request.url}`);
  await next();
});

app.use(snippetRouter.routes());
app.use(snippetRouter.allowedMethods());

// static file serving
app.use(async (ctx, next) => {
  try {
    await send(ctx, ctx.request.url.pathname, {
      root: `${Deno.cwd()}/public`,
      index: "index.html",
    });
  } catch {
    await next();
  }
});

const PORT = 8087;
console.log(`🚀 Server started at http://localhost:${PORT}`);

await app.listen({ port: PORT });
