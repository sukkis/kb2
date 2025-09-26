import {
  assert,
  assertEquals,
  assertObjectMatch,
  defineTestSuite,
  resetKv,
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
      assertEquals(typeof body.uuid, "string");
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
      const { uuid } = postRes.body;

      // Now, fetch it by id
      const getReq = await superoak(app);
      const getRes = await getReq.get(`/snippet/${uuid}`).expect(200);
      assertEquals(getRes.body.title, payload.title);
      assertEquals(getRes.body.content, payload.content);
      assertEquals(getRes.body.uuid, uuid);
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

  // Negative: id not found -> 404
  await t.step(
    "GET /snippet/:id with non-existent id returns 404",
    async () => {
      const req = await superoak(app);
      const res = await req.get("/snippet/doesnotexist").expect(404);
      assertEquals(res.body.error, "no snippet by id doesnotexist exists ");
    },
  );

  // Happy path: /delete/:id endpoint
  await t.step(
    "DELETE /delete/:id removes a snippet (happy path)",
    async () => {
      // Create a snippet to delete
      const payload = { title: "Delete me", content: "Temporary snippet" };
      const postReq = await superoak(app);
      const postRes = await postReq.post("/add").send(payload).expect(201);
      const { uuid } = postRes.body;

      // Verify snippet exists
      const getReq = await superoak(app);
      const getRes = await getReq.get(`/snippet/${uuid}`).expect(200);
      assertEquals(getRes.body.title, payload.title);
      assertEquals(getRes.body.content, payload.content);
      assertEquals(getRes.body.uuid, uuid);

      // Delete the snippet
      const delReq = await superoak(app);
      await delReq.delete(`/delete/${uuid}`).expect(200);

      // Wait briefly to ensure KV is consistent
      await new Promise((r) => setTimeout(r, 20));

      // Verify snippet is gone
      const getReq2 = await superoak(app);
      const getRes2 = await getReq2.get(`/snippet/${uuid}`).expect(404);
      assertEquals(getRes2.body.error, `no snippet by id ${uuid} exists `);
    },
  );

  // Negative: DELETE /delete/:id with non-existent id -> 404
  await t.step(
    "DELETE /delete/:id with non-existent id returns 404",
    async () => {
      const delReq = await superoak(app);
      const res = await delReq.delete("/delete/doesnotexist");
      assert(res.status === 404, `Expected 404, got ${res.status}`);
    },
  );

  // Negative: DELETE /delete/:id with no id -> 400 or 404
  await t.step(
    "DELETE /delete/:id with missing id returns 400 or 404",
    async () => {
      const delReq = await superoak(app);
      const res = await delReq.delete("/delete/");
      assert(
        [400, 404].includes(res.status),
        `Expected 400 or 404, got ${res.status}`,
      );
    },
  );

  // Happy path: /list endpoint
  await t.step("GET /snippets returns all snippets", async () => {
    // Clear existing snippets
    await resetKv();

    // Add multiple snippets
    const snippetsToAdd = [
      { title: "Snippet 1", content: "Content 1" },
      { title: "Snippet 2", content: "Content 2" },
      { title: "Snippet 3", content: "Content 3" },
    ];

    for (const snippet of snippetsToAdd) {
      const postReq = await superoak(app);
      await postReq.post("/add").send(snippet).expect(201);
    }

    // Fetch the list
    const listReq = await superoak(app);
    const listRes = await listReq.get("/snippets").expect(200); // Adjusted to /list
    const body = listRes.body as Array<Record<string, unknown>>;

    // Verify we got all snippets
    assertEquals(body.length, snippetsToAdd.length);
    for (const snippet of snippetsToAdd) {
      assert(
        body.some((s) =>
          s.title === snippet.title && s.content === snippet.content
        ),
        `Snippet with title "${snippet.title}" not found in response`,
      );
    }
  });

  // Negative: GET /snippets returns empty array when store is empty
  await t.step(
    "GET /snippets returns empty array when no snippets exist",
    async () => {
      await resetKv();
      const req = await superoak(app);
      const res = await req.get("/snippets").expect(200);
      assert(Array.isArray(res.body), "Response should be an array");
      assertEquals(res.body.length, 0);
    },
  );

  // Negative: GET /snippets with unsupported method returns 405
  await t.step(
    "POST /snippets returns 405 Method Not Allowed",
    async () => {
      const req = await superoak(app);
      const res = await req.post("/snippets");
      assert(res.status === 405, `Expected 405, got ${res.status}`);
    },
  );

  // Negative: GET /snippets with invalid query params (if supported)
  await t.step(
    "GET /snippets with invalid query params returns 400 or 404",
    async () => {
      const req = await superoak(app);
      const res = await req.get("/snippets?page=notanumber");
      assert(
        [400, 404].includes(res.status),
        `Expected 400 or 404, got ${res.status}`,
      );
    },
  );
});
