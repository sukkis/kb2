// Script to start backend server with test KV for frontend tests
import { main } from "./src/main.ts";

// Create a temporary directory for the test KV
const tmpDir = await Deno.makeTempDir({ prefix: "kv_test_server_" });
const testKv = await Deno.openKv(`${tmpDir}/kv.sqlite`);

// Set global test KV for all backend code
declare global {
  var __TEST_KV__: Deno.Kv | undefined;
}
globalThis.__TEST_KV__ = testKv;

// Optionally, log for debugging
console.log("Test KV set at", `${tmpDir}/kv.sqlite`);

// Start the backend server (using your normal main entrypoint)
await main();

// Cleanup logic (optional, for graceful shutdown)
addEventListener("unload", () => {
  testKv.close();
  Deno.remove(tmpDir, { recursive: true }).catch(() => {});
});
