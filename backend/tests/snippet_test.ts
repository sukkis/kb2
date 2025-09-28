import { Snippet, SearchResult } from "../../shared/types.ts";
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

      const body = response.body as Snippet;

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
    const body = listRes.body as Array<Snippet>;

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


  // Integration test for /search endpoint
  await t.step(
    "GET /search endpoint returns correct SearchResult for matching snippet",
    async () => {
      await resetKv();
      // Add two snippets
      const snippet1 = {
        title: "Python Poetry installation",
        content: "How to install Python packages using Poetry.",
      };
      const snippet2 = {
        title: "Deno KV basics",
        content: "Introduction to Deno's key-value store.",
      };

      // Add snippet1
      const postReq1 = await superoak(app);
      const postRes1 = await postReq1.post("/add").send(snippet1).expect(201);
      const _created1 = postRes1.body as Snippet;

      // Add snippet2
      const postReq2 = await superoak(app);
      const postRes2 = await postReq2.post("/add").send(snippet2).expect(201);
      const _created2 = postRes2.body as Snippet;

      // Fetch all snippets to get UUIDs
      const listReq = await superoak(app);
      const listRes = await listReq.get("/snippets").expect(200);
      const allSnippets = listRes.body as Snippet[];

      // Find UUIDs for the snippets
      const uuid1 = allSnippets.find((s) => s.title === snippet1.title)?.uuid;
      //const uuid2 = allSnippets.find((s) => s.title === snippet2.title)?.uuid;

      // Perform a search that matches only snippet1
      const searchReq = await superoak(app);
      const searchRes = await searchReq.get("/search?query=Poetry").expect(200);
      const searchResults = searchRes.body as SearchResult[];

      // Assert that the result contains only snippet1's UUID and correct score
      assertEquals(searchResults.length, 1, "Expected one search result");
      assertEquals(searchResults[0].uuid, uuid1, "Expected UUID of snippet1");
      assertEquals(searchResults[0].score, 1, "Expected score of 1 for single word match");
    },
    );

    // Negative: /search with query that matches no snippets
    await t.step(
      "GET /search endpoint with non-matching query returns empty array",
      async () => {
        await resetKv();
        // Add a snippet
        const snippet = {
          title: "Deno KV basics",
          content: "Introduction to Deno's key-value store.",
        };
        const postReq = await superoak(app);
        await postReq.post("/add").send(snippet).expect(201);

        // Search for a term that does not exist
        const searchReq = await superoak(app);
        const searchRes = await searchReq.get("/search?query=foobar").expect(200);
        const searchResults = searchRes.body as SearchResult[];
        assertEquals(searchResults.length, 0, "Expected no search results");
      },
    );

    // Negative: /search with missing query param
    await t.step(
      "GET /search endpoint with missing query param returns error",
      async () => {
        const searchReq = await superoak(app);
        const searchRes = await searchReq.get("/search");
        assert(
          [400, 422].includes(searchRes.status),
          `Expected 400 or 422, got ${searchRes.status}`,
        );
        assert(
          typeof searchRes.body.error === "string",
          "Expected error message in response body",
        );
      },
    );

    // Negative: /search with overly long query param
    await t.step(
      "GET /search endpoint with overly long query param returns error",
      async () => {
        const longQuery = "a".repeat(100); // assuming max length is less than 100
        const searchReq = await superoak(app);
        const searchRes = await searchReq.get(`/search?query=${longQuery}`);
        assert(
          [400, 422].includes(searchRes.status),
          `Expected 400 or 422, got ${searchRes.status}`,
        );
        assert(
          typeof searchRes.body.error === "string",
          "Expected error message in response body",
        );
      },
    );

    // Negative: /search with invalid characters in query param
    await t.step(
      "GET /search endpoint with invalid characters in query param returns error",
      async () => {
        const invalidQuery = "validpart!@#$%^&*()"; // assuming special chars are not allowed
        const searchReq = await superoak(app);
        const searchRes = await searchReq.get(`/search?query=${invalidQuery}`);
        assert(
          [400, 422].includes(searchRes.status),
          `Expected 400 or 422, got ${searchRes.status}`,
        );
        assert(
          typeof searchRes.body.error === "string",
          "Expected error message in response body",
        );
      },
    );
  },
);
