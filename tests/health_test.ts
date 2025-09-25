import {
  assertEquals,
  assertObjectMatch,
} from "@std/asserts";

import { superoak } from "./superoak_wrapper.ts";

import { createTestApp } from "../src/routes/testRouter.ts";
import { makeTempKv } from "./helpers.ts";

Deno.test("GET /health returns a JSON health payload", async () => {
  // Spin up a temporary KV (isolated for this test)
  const kv = await makeTempKv();

  try {
    // Build the test‑only Oak app, injecting the KV.
    const app = createTestApp(kv);

    //  Use SuperOak to issue an in‑process HTTP request.
    const request = await superoak(app);
    const response = await request.get("/health").expect(200);

    // The response body is already parsed as JSON by SuperOak.
    const body = response.body as Record<string, unknown>;

    // -----------------------------------------------------------------
    // Assertions – we only care that the shape is correct.
    // -----------------------------------------------------------------
    assertObjectMatch(body, { status: "ok" });
    // The timestamp should be an ISO‑8601 string.
    const ts = body.timestamp as string;
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    assertEquals(isoRegex.test(ts), true);
  } finally {
    kv.close(); // We need to always close KV even if we throw an error.
  }
});
