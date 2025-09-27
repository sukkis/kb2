import {
  type Application,
  assertEquals,
  assertObjectMatch,
  initSuite,
  resetKv,
  superoak,
  teardownSuite,
} from "./setup.ts";

let app: Application; // will be set in the suite’s before-all step

Deno.test("Health endpoint suite", async (t) => {
  // ---------------------------------------------------------
  // Suite setup (runs once)
  // ---------------------------------------------------------
  await t.step("setup suite", async () => {
    const suite = await initSuite();
    app = suite.app; // <-- assign the shared Application
  });

  // ---------------------------------------------------------
  // Optional: wipe KV before each individual test
  // ---------------------------------------------------------
  await t.step("reset KV before each test", async () => {
    await resetKv();
  });

  // ---------------------------------------------------------
  // Actual test case
  // ---------------------------------------------------------
  await t.step("GET /health returns JSON payload", async () => {
    const request = await superoak(app);
    const response = await request.get("/health").expect(200);

    const body = response.body as Record<string, unknown>;
    assertObjectMatch(body, { status: "ok" });

    const ts = body.timestamp as string;
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    assertEquals(isoRegex.test(ts), true);
  });

  // ---------------------------------------------------------
  // Suite teardown (runs once after all tests)
  // ---------------------------------------------------------
  await t.step("teardown suite", async () => {
    await teardownSuite();
  });
});
