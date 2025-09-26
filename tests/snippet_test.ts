import {
  type Application as _Application,
  assertEquals,
  assertObjectMatch,
  defineTestSuite,
  superoak,
} from "./setup.ts";

defineTestSuite("Snippet endpoints test suite", async (t, app) => {
  await t.step(
    "POST /add with valid payload returns 201 and snippet",
    async () => {
      const payload = {
        title: "Test Snippet",
        content: "This is a test snippet.",
      };

      const request = await superoak(app);
      const response = await request.post("/add").send(payload).expect(201);

      const body = response.body as Record<string, unknown>;

      // Basic shape check
      assertObjectMatch(body, {
        title: payload.title,
        content: payload.content,
      });

      // Check that user_id and timestamp are present
      assertEquals(typeof body.user_id, "string");
      assertEquals(typeof body.timestamp, "string");
    },
  );
});
