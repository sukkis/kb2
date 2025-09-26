import {
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

  // Negative test: body missing -> 400
  await t.step(
    "POST /add with missing body returns 400",
    async () => {
      const request = await superoak(app);
      const response = await request.post("/add").expect(400);
      assertEquals(response.body.error, "missing request body");
    },
  );

  // Negative test: title missing -> 422
  await t.step(
    "POST /add with missing title returns 422",
    async () => {
      const payload = { content: "No title here" };
      const request = await superoak(app);
      const response = await request.post("/add").send(payload).expect(422);
      assertEquals(response.body.error, "`title` and `content` are required");
    },
  );

  // Negative test: content missing -> 422
  await t.step(
    "POST /add with missing content returns 422",
    async () => {
      const payload = { title: "No content here" };
      const request = await superoak(app);
      const response = await request.post("/add").send(payload).expect(422);
      assertEquals(response.body.error, "`title` and `content` are required");
    },
  );
});
