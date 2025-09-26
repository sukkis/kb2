import { Context, Router, RouterContext } from "../deps.ts"; // Oak symbols re‑exported in deps.ts
import { getSnippet, isoTimestamp, saveSnippet } from "../../kv/kvSnippet.ts"; // we need to open Deno KV for persistence and make the handle available.

// Handler that just writes “hello” as plain‑text
function sayHello(ctx: Context) {
  ctx.response.status = 200;
  ctx.response.type = "text/plain";
  ctx.response.body = "hello";
}

async function addSnippet(ctx: Context) {
  // Ensure a body exists
  if (!ctx.request.hasBody) {
    ctx.response.status = 400;
    ctx.response.type = "application/json";
    ctx.response.body = { error: "missing request body" };
    return;
  }

  // Parse the JSON payload
  const body = ctx.request.body({ type: "json" });
  const payload = await body.value; // { title: string, content: string }

  // Payload validation
  if (!payload.title || !payload.content) {
    ctx.response.status = 422;
    ctx.response.type = "application/json";
    ctx.response.body = { error: "`title` and `content` are required" };
    return;
  }

  // a unique identifier for the snippet
  const uuid = crypto.randomUUID();

  // convert from Unix Epoch to ISO format
  const formatted = isoTimestamp(Date.now());
  const created: Record<string, unknown> = {
    user_id: uuid,
    title: payload.title,
    content: payload.content,
    timestamp: formatted,
  };

  // persist the snippet in Deno KV
  await saveSnippet(uuid, created);

  // response back to user
  ctx.response.status = 201;
  ctx.response.type = "application/json";
  ctx.response.body = created;
}

async function getSingleSnippet(ctx: RouterContext<"/snippet/:id">) {
  const id = ctx.params.id;

  if (!id) {
    ctx.response.status = 400;
    ctx.response.type = "application/json";
    ctx.response.body = { error: "missing snippet id" };
  }

  const snippet = await getSnippet(id);

  if (!snippet) {
    ctx.response.status = 404;
    ctx.response.type = "application/json";
    ctx.response.body = { error: `no snippet by id ${id} exists ` };
  }

  // response back to user
  ctx.response.status = 200;
  ctx.response.type = "application/json";
  ctx.response.body = snippet as Record<string, unknown>;
}

// Build the router and expose it
const router = new Router();

router.get("/", sayHello);
router.post("/add", addSnippet);
router.get("/snippet/:id", getSingleSnippet);

export default router; // ← this is what main.ts will import
