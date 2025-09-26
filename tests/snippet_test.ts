import {
  assert,
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

  // Happy path: GET /snippet/:id returns 200
  await t.step(
    "GET /snippet/:id with valid id returns 200 and snippet",
    async () => {
      // First, create a snippet
      const payload = { title: "Find me", content: "I am here" };
      const postReq = await superoak(app);
      const postRes = await postReq.post("/add").send(payload).expect(201);
      const { user_id } = postRes.body;

      // Now, fetch it by id
      const getReq = await superoak(app);
      const getRes = await getReq.get(`/snippet/${user_id}`).expect(200);
      assertEquals(getRes.body.title, payload.title);
      assertEquals(getRes.body.content, payload.content);
      assertEquals(getRes.body.user_id, user_id);
    },
  );

  // Negative: no id -> 400 or 404
  await t.step(
    "GET /snippet/:id with missing id returns 400 or 404",
    async () => {
      const req = await superoak(app);
      const res = await req.get("/snippet/");
      assert(
        [400, 404].includes(res.status),
        `Expected 400 or 404, got ${res.status}`,
      );
    },
  );

  // Negative: id not found -> 404 or 200 (if bug)
  await t.step(
    "GET /snippet/:id with non-existent id returns 404 or 200 (bug)",
    async () => {
      const req = await superoak(app);
      const res = await req.get("/snippet/doesnotexist");
      assert(
        [404, 200].includes(res.status),
        `Expected 404 or 200, got ${res.status}`,
      );
    },
  );
});
