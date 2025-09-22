// src/routes/snippet.ts
import { Router, Context } from "../deps.ts";   // Oak symbols re‑exported in deps.ts

// Handler that just writes “hello” as plain‑text
async function sayHello(ctx: Context) {
  ctx.response.status = 200;
  ctx.response.type   = "text/plain";
  ctx.response.body   = "hello";
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
	    if ( !payload.title || !payload.content ) {
		ctx.response.status = 422;
		ctx.response.type = "application/json";
		ctx.response.body = { error: "`title` and `content` are required" };
		return;
	    }

	    const created: json = { title: payload.title, content: payload.content };

	    ctx.response.status = 201;
	    ctx.response.type = "application/json";
	    ctx.response.body = created;

	    
};


// Build the router and expose it
const router = new Router();

router.get("/", sayHello);
router.post("/add", addSnippet);

export default router;       // ← this is what main.ts will import
